const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /users/:userId/carts/current
 * {
 *
 * }
 * Response
 * {
 *   Cart
 * }
 */
module.exports = (app) => {
  app.get('/users/:userId/carts/current', isAuth());

  app.get('/users/:userId/carts/current', async (req, res) => {
    const { Cart, Item, CartItem, Attribute } = req.app.locals.models;

    try {
      if (req.params.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

      const cart = await Cart.findOne({
        attributes: ['id', 'paidAt', 'transactionId', 'transactionState'],
        where: {
          userId: req.params.userId,
          transactionState: 'draft',
        },

        include: {
          model: CartItem,
          attributes: ['id', 'quantity', 'forUserId'],
          include: [{
            model: Item,
            attributes: ['name', 'key', 'price', 'stock', 'infos'],
          }, {
            model: Attribute,
            attributes: ['label', 'value'],
          }],
        },
      });

      return res
        .status(200)
        .json(cart)
        .end();
    }
    catch (error) {
      return errorHandler(error, res);
    }
  });
};