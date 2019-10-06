const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * DELETE /carts/:cartId/cartItems/:id
 * {
 *
 * }
 * Response
 * {
 *
 * }
 */

module.exports = (app) => {
  app.delete('/carts/:cartId/cartItems/:id', [isAuth()]);

  app.delete('/carts/:cartId/cartItems/:id', async (req, res) => {
    const { CartItem } = req.app.locals.models;

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

      await cartItem.destroy();

      return res
        .status(204)
        .end();
    }

    catch (err) {
      return errorHandler(err, res);
    }
  });
};