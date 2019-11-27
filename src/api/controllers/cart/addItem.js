const { check } = require('express-validator');
const { Op } = require('sequelize');

const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');
const tshirtStocks = require('../../utils/tshirtStocks');
const { isTournamentFull } = require('../../utils/isFull');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;
const ITEM_SHIRT_MALE_ID = 6;
const ITEM_SHIRT_FEMALE_ID = 7;


const CheckAddItem = [
  check('itemId').isInt(),
  check('quantity').isInt(),
  check('attributeId')
    .optional()
    .isInt(),
  check('forUserId')
    .optional()
    .isUUID(),
  validateBody(),
];


/**
 * Add an item to a user's cart.
 *
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
const AddItemToCart = (cartIdString, cartItemModel, userModel, cartModel, teamModel, tournamentModel) => async (req, res) => {


  const cartId = req.params[cartIdString];

  try {
    if (req.body.forUserId) {
      const user = await userModel.findByPk(req.body.forUserId);
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
    const cartCount = await cartModel.count({
      where: {
        id: cartId,
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
      cartId,
    };

    const itemId = parseInt(req.body.itemId);
    const attributeId = parseInt(req.body.attributeId);
    // Attention: pas de verification d'attribute si ça peut correspondre à un itemId
    // Est-ce utile ?
    if (itemId === ITEM_PLAYER_ID) {
      const forUser = await userModel.findByPk(req.body.forUserId, {
        include: [
          {
            model: teamModel,
            include: [
              {
                model: tournamentModel,
                include: [
                  {
                    model: teamModel,
                    include: [userModel],
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

    if (itemId === ITEM_VISITOR_ID) {
      const visitorItem = await Item.findByPk(ITEM_VISITOR_ID);

      const maxVisitors = visitorItem.stock;

      const actualVisitors = await cartItemModel.sum('quantity', {
        where: {
          itemId: ITEM_VISITOR_ID,
        },
        include: [
          {
            model: cartModel,
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
        (stock) => stock.attributeId === attributeId && stock.itemId === itemId,
      ).stock;

      const actualTShirt = await cartItemModel.sum('quantity', {
        where: {
          itemId,
          attributeId,
        },
        include: [
          {
            model: cartModel,
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

    const newCartItem = await cartItemModel.create(cartItem);

    return res
      .status(200)
      .json(newCartItem)
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { AddItemToCart, CheckAddItem };
