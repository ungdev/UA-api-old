const { check } = require('express-validator');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

/**
 * PUT /carts/:cartId/cartItems/:id
 * {
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
  app.put('/carts/:cartId/cartItems/:id', [isAuth()]);

  app.put('/carts/:cartId/cartItems/:id', [
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

  app.put('/carts/:cartId/cartItems/:id', async (req, res) => {
    const { CartItem, User } = req.app.locals.models;

    try {
      const cartItem = await CartItem.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
          cartId: req.params.cartId,
        },
      });

      if (!cartItem) {
        return res
          .status(404)
          .json({ error: 'ITEM_NOT_FOUND' })
          .end();
      }

      if (req.body.forUserId) {
        const user = await User.findOne(req.body.forUserId);
        if (!user) {
          return res
            .status(404)
            .json({ error: 'USER_NOT_FOUND' })
            .end();
        }
      }
      else req.body.forUserId = req.user.id;

      cartItem.forUserId = req.body.forUserId;
      cartItem.quantity = req.body.quantity;
      cartItem.attributeId = req.body.attributeId;

      // Attention: pas de verification d'attribute si ça peut correspondre à un itemId
      // Est-ce utile ?
      await cartItem.save();

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};