const { fn } = require('sequelize');
const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});
const generatePdf = require('../utils/sendPDF');
const errorHandler = require('../utils/errorHandler');
const sendPaymentMail = require('../mail/payment');
const log = require('../utils/log')(module);

module.exports = (app) => {
  // todo: SLACK HOOKS !!!!! si differents + enregistrer !!!!!!!!!
  app.post('/user/pay/callback', (req, res) => res.status(204));

  app.get('/user/pay/return', etupay.middleware, async (req, res) => {
    // Jamais utilisée car géré par le middleware

    const { Cart, CartItem, Item, Attribute, User } = req.app.locals.models;

    try {
      if (!req.query.payload) {
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}&error=NO_PAYLOAD`);
      }

      // Récupère le cartId depuis le payload envoyé à /carts/:id/pay
      const { cartId } = JSON.parse(Buffer.from(req.etupay.serviceData, 'base64').toString());

      let cart = await Cart.findOne({
        where: {
          id: cartId,
          transactionState: 'draft',
        },

        include: [{
          model: CartItem,
          attributes: ['id', 'quantity', 'forUserId'],
          include: [{
            model: Item,
            attributes: ['name', 'key', 'price', 'infos'],
          }, {
            model: Attribute,
            attributes: ['label', 'value'],
          }],
        }, {
          model: User,
          attributes: ['username', 'email'],
        }],
      });

      if (!cart) {
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}&error=CART_NOT_FOUND`);
      }

      cart.transactionState = req.etupay.step;
      cart.transactionId = req.etupay.transactionId;

      if (cart.transactionState !== 'paid') {
        await cart.save();
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}&error=TRANSACTION_ERROR`);
      }

      cart.paidAt = fn('NOW');
      await cart.save();

      // Comme les PDF prennent du temps à generer, on redirige le user avant
      res.redirect(process.env.ARENA_ETUPAY_SUCCESSURL);

      cart = cart.toJSON();

      cart.cartItems = await Promise.all(cart.cartItems.map(async (cartItem) => {
        const forUser = await User.findByPk(cartItem.forUserId, {
          attributes: ['id', 'username', 'firstname', 'lastname', 'email', 'barcode'],
        });

        const newCartItem = {
          ...cartItem,
          forUser,
        };

        delete newCartItem.forUserId;
        return newCartItem;
      }));

      let pdfTickets = await Promise.all(cart.cartItems.map(async (cartItem) => {
        if (cartItem.item.key === 'player' || cartItem.item.key === 'visitor') {
          // todo: moche à cause de seuquelize, peut etre moyen de raccourcir en une requête

          return generatePdf(cartItem.forUser, cartItem.item.name);
        }
        return null;
      }));

      pdfTickets = pdfTickets.filter((ticket) => ticket !== null);

      const users = cart.cartItems.reduce(((previousValue, cartItem) => {
        const indexUser = previousValue
          .findIndex((user) => user.username === cartItem.forUser.username);

        // Si il trouve
        if (indexUser !== -1) {
          previousValue[indexUser].items.push({
            name: cartItem.item.name,
            quantity: cartItem.quantity,
            price: cartItem.item.price * cartItem.quantity,
            attribute: cartItem.attribute ? cartItem.attribute.label : '',
          });
        }

        else {
          previousValue.push({
            username: cartItem.forUser.username,
            items: [{
              name: cartItem.item.name,
              quantity: cartItem.quantity,
              price: cartItem.item.price * cartItem.quantity,
            }],
          });
        }

        return previousValue;
      }), []);


      await sendPaymentMail(cart.user.email, {
        username: cart.user.username,
        users,
        link: '#', // todo: a changer !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      }, pdfTickets);
      log.debug(`Mail sent to ${cart.user.email}`);
      return null;
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
