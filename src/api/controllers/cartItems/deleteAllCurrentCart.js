const { Op } = require('sequelize');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * DELETE /users/:userId/carts/current/items
 * {
 *
 * }
 * Response
 * {
 * }
 */
module.exports = (app) => {
  app.delete('/users/:userId/carts/current/items', isAuth());

  app.delete('/users/:userId/carts/current/items', async (req, res) => {
    const { CartItem, Cart } = req.app.locals.models;

    try {
      if (req.params.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }


      let cartItems = await CartItem.findAll({
        attributes: ['id'],
        include: {
          model: Cart,
          attributes: [],
          where: {
            userId: req.params.userId,
            transactionState: 'draft',
          },
        },
      });

      cartItems = cartItems.map((cartItem) => cartItem.id);


      await CartItem.destroy({
        where: {
          id: {
            [Op.in]: cartItems,
          },
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