const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * DELETE /users/:userId/carts/current
 * {
 *
 * }
 * Response
 * {
 * }
 */
module.exports = (app) => {
  app.delete('/users/:userId/carts/current', isAuth());

  app.delete('/users/:userId/carts/current', async (req, res) => {
    const { Cart } = req.app.locals.models;

    try {
      if (req.params.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

      await Cart.destroy({
        where: {
          userId: req.params.userId,
          transactionState: 'draft',
        },
      });

      return res
        .status(204)
        .end();
    }
    catch (error) {
      return errorHandler(error, res);
    }
  });
};