const { check } = require('express-validator');

const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

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
const AddItemToCart = (cartIdString, cartItemModel, userModel, cartModel) => {
  return async (req, res) => {
    const forUser = req.body.forUserId || req.user.id;
    const cartId = req.params[cartIdString];
    try {
      const user = await userModel.findByPk(forUser);
      if (!user) {
        return res
          .status(404)
          .json({ error: 'USER_NOT_FOUND' })
          .end();
      }
      // A modifier après pour l'admin
      const cartCount = await cartModel.count({
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
        forUserId: forUser,
        cartId: cartId,
      };

      // Attention: pas de verification d'attribute si ça peut correspondre à un itemId
      // Est-ce utile ?
      const newCartItem = await cartItemModel.create(cartItem);

      return res
        .status(200)
        .json(newCartItem)
        .end();
    } catch (err) {
      return errorHandler(err, res);
    }
  };
};

module.exports = { AddItemToCart, CheckAddItem };
