const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * POST /users/:userID/carts
 * {
 *
 * }
 * Response
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/users/:userId/carts', isAuth());

  app.post('/users/:userId/carts', async (req, res) => {
    const { Cart } = req.app.locals.models;

    try {
      if (req.params.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

      const draftCount = await Cart.count({
        where: {
          userId: req.params.userId,
          transactionState: 'draft',
        },
      });

      if (draftCount !== 0) {
        return res
          .status(400)
          .json({ error: 'DUPLICATE_ENTRY' })
          .end();
      }

      await Cart.create({ userId: req.params.userId });

      return res
        .status(204)
        .end();
    }

    catch (error) {
      return errorHandler(error, res);
    }
  });
};