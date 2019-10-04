const { check } = require('express-validator');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

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
module.exports = (app) => {
  app.post('/carts/:cartId/cartItems', [isAuth()]);

  app.post('/carts/:cartId/cartItems', [
    check('itemId')
      .isInt(),
    check('quantity')
      .isInt(),
    check('attributeId')
      .optional()
      .isInt(),
    check('forUserId')
      .optional()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/carts/:cartId/cartItems', async (req, res) => {
    const { CartItem, User, Cart } = req.app.locals.models;

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
      else req.body.forUserId = req.user.id;

      // A modifier après pour l'admin
      const cartCount = await Cart.count({
        where: {
          id: req.params.cartId,
          userId: req.user.id,
        },
      });

      if (cartCount !== 1) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

      const cartItem = {
        ...req.body,
        userId: req.user.id, // Attention ! Pas compatible avec admin
        cartId: req.params.cartId,
      };

      // Attention: pas de verification d'attribute si ça peut correspondre à un itemId
      // Est-ce utile ?
      await CartItem.create(cartItem);

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};