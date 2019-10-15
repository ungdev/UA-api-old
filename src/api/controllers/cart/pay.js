const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const { isTournamentFull } = require('../../utils/isFull');
const removeAccent = require('../../utils/removeAccents');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;
const euro = 100;
const { Basket } = etupay;

module.exports = (app) => {
  app.post('/users/:userId/carts/:id/pay', [isAuth()]);


  app.post('/users/:userId/carts/:id/pay', async (req, res) => {
    const { Cart, CartItem, Item, Attribute, Team, User, Tournament } = req.app.locals.models;

    try {
      const cart = await Cart.findOne({
        where: {
          id: req.params.id,
          userId: req.params.userId,
          transactionState: 'draft',
        },

        include: {
          model: CartItem,
          attributes: ['id', 'quantity', 'forUserId'],
          include: [{
            model: Item,
            attributes: ['name', 'key', 'price', 'stock', 'infos', 'id'],
          }, {
            model: Attribute,
            attributes: ['label', 'value'],
          }],
        },
      });

      if (!cart) {
        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      if (cart.cartItems.some((cartItem) => cartItem.item.id === ITEM_VISITOR_ID)) {
        const visitorItem = await Item.findByPk(ITEM_VISITOR_ID);

        const maxVisitors = visitorItem.stock;

        const actualVisitors = await CartItem.sum('quantity', {
          where: {
            itemId: ITEM_VISITOR_ID,
          },
          include: [{
            model: Cart,
            attributes: [],
            where: {
              transactionState: 'paid',
            },
          }],
        });

        const visitorsOrdered = cart.cartItems.reduce((previousValue, cartItem) => {
          if (cartItem.item.id !== ITEM_VISITOR_ID) {
            return previousValue;
          }
          return previousValue + cartItem.quantity;
        }, 0);

        if (maxVisitors - actualVisitors - visitorsOrdered < 0) {
          return res
            .status(400)
            .json({ error: 'VISITOR_FULL' })
            .end();
        }
      }
      if (cart.cartItems.some((cartItem) => cartItem.item.id === ITEM_PLAYER_ID)) {
        await Promise.all(cart.cartItems.map(async (cartItem) => {
          if (cartItem.item.id === ITEM_PLAYER_ID) {
            const team = await Team.findByPk(req.user.teamId, {
              include: [
                { model: Tournament,
                  include: [
                    { model: Team,
                      include: [User],
                    }],
                },
              ],
            });
            const isFull = await isTournamentFull(team.tournament, req);
            if (isFull) {
              return res
                .status(400)
                .json({ error: 'TOURNAMENT_FULL' })
                .end();
            }
          }
          return null;
        }));
      }

      const data = JSON.stringify({ cartId: cart.id });
      const encoded = Buffer.from(data).toString('base64');

      const basket = new Basket(
        'Inscription UTT Arena',
        removeAccent(req.user.firstname),
        removeAccent(req.user.lastname),
        req.user.email,
        'checkout',
        encoded,
      );

      const isPartnerSchool = process.env.ARENA_PRICES_PARTNER_MAILS.split(',').some((school) => req.user.email.toLowerCase().endsWith(school));

      cart.cartItems.forEach((cartItem) => {
        if (cartItem.item.key === 'player' && isPartnerSchool && cartItem.forUserId === req.user.id) {
          // todo: HARDECODE !!!!!
          cartItem.item.price = 15;
        }

        const name = cartItem.attribute ? `${cartItem.item.name} ${cartItem.attribute.label}` : cartItem.item.name;
        basket.addItem(name, cartItem.item.price * euro, cartItem.quantity);
      });

      return res
        .status(200)
        .json({ url: basket.compute() })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};