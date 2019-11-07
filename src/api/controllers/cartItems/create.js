const { check } = require('express-validator');
const { Op } = require('sequelize');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');
const { isTournamentFull } = require('../../utils/isFull');
const tshirtStocks = require('../../utils/tshirtStocks');

/**
 * POST /carts/:cartId/cartItems
 * {
 *  itemId: int
 *  quantity: int
 *  attributeId: int, optionnal
 *  forUserId: UUID, optionnal. For self if null
 * }
 * Response
 * {
 *
 * }
 */
const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;
const ITEM_SHIRT_MALE_ID = 6;
const ITEM_SHIRT_FEMALE_ID = 7;

module.exports = function createCartItem(app) {
  app.post('/carts/:cartId/cartItems', [isAuth()]);

  app.post('/carts/:cartId/cartItems', [
    check('itemId').isInt(),
    check('quantity').isInt(),
    check('attributeId')
      .optional()
      .isInt(),
    check('forUserId')
      .optional()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/carts/:cartId/cartItems', async (req, res) => {
    const { CartItem, User, Cart, Tournament, Item, Team } = req.app.locals.models;

    try {
      if (req.body.forUserId) {
        const user = await User.findByPk(req.body.forUserId);
        if (!user) {
          return res
            .status(404)
            .json({ error: 'USER_NOT_FOUND' })
            .end();
        }
      }
      else {
        req.body.forUserId = req.user.id;
      }
      // A modifier après pour l'admin
      const cartCount = await Cart.count({
        where: {
          id: req.params.cartId,
          userId: req.user.id,
          transactionState: 'draft',
        },
      });

      if (cartCount !== 1) {
        return res
          .status(400)
          .json({ error: 'BAD_REQUEST' })
          .end();
      }

      const cartItem = {
        ...req.body,
        userId: req.user.id, // Attention ! Pas compatible avec admin
        cartId: req.params.cartId,
      };

      // Attention: pas de verification d'attribute si ça peut correspondre à un itemId
      // Est-ce utile ?
      if (req.body.itemId === ITEM_PLAYER_ID) {
        const forUser = await User.findByPk(req.body.forUserId, {
          include: [
            {
              model: Team,
              include: [
                {
                  model: Tournament,
                  include: [
                    {
                      model: Team,
                      include: [User],
                    },
                  ],
                },
              ],
            },
          ],
        });
        const isFull = await isTournamentFull(forUser.team.tournament, req);
        if (isFull) {
          return res
            .status(400)
            .json({ error: 'TOURNAMENT_FULL' })
            .end();
        }
      }

      const itemId = parseInt(req.body.itemId);
      if (itemId === ITEM_VISITOR_ID) {
        const visitorItem = await Item.findByPk(ITEM_VISITOR_ID);

        const maxVisitors = visitorItem.stock;

        const actualVisitors = await CartItem.sum('quantity', {
          where: {
            itemId: ITEM_VISITOR_ID,
          },
          include: [
            {
              model: Cart,
              attributes: [],
              where: {
                transactionState: {
                  [Op.in]: ['paid', 'draft'],
                },
              },
            },
          ],
        });

        if (maxVisitors < actualVisitors + req.body.quantity) {
          return res
            .status(400)
            .json({ error: 'VISITOR_FULL' })
            .end();
        }
      }

      if (itemId === ITEM_SHIRT_MALE_ID || itemId === ITEM_SHIRT_FEMALE_ID) {
        const maxTShirt = tshirtStocks.find(
          (stock) => stock.attributeId === req.body.attributeId && stock.itemId === req.body.itemId,
        ).stock;

        const actualTShirt = await CartItem.sum('quantity', {
          where: {
            itemId,
            attributeId: req.body.attributeId,
          },
          include: [
            {
              model: Cart,
              attributes: [],
              where: {
                transactionState: {
                  [Op.in]: ['paid', 'draft'],
                },
              },
            },
          ],
        });

        if (maxTShirt < actualTShirt + req.body.quantity) {
          return res
            .status(400)
            .json({ error: 'TSHIRT_FULL' })
            .end();
        }
      }

      const newCartItem = await CartItem.create(cartItem);

      return res
        .status(200)
        .json(newCartItem)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
