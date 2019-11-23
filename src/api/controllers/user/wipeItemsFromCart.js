const { Op } = require('sequelize');

const errorHandler = require('../../utils/errorHandler');

/**
 * Delete every items from a user cart. **Doesn't delete the cart**
 *
 * DELETE /users/:userId/carts/current/items
 * {
 *
 * }
 * Response
 * {
 * }
 *
 * @param {string} userIdString the name of the user id parameter in the route
 * @param {object} cartModel the cartItem model to query
 * @param {object} cartItemModel the cartModel model to query
 */
const WipeItemsFromCart = (userIdString, cartItemModel, cartModel) => async (req, res) => {
  const userId = req.params[userIdString];
  try {
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }

    let cartItems = await cartItemModel.findAll({
      attributes: ['id'],
      include: {
        model: cartModel,
        attributes: [],
        where: {
          userId,
          transactionState: 'draft',
        },
      },
    });

    cartItems = cartItems.map((cartItem) => cartItem.id);

    await cartItemModel.destroy({
      where: {
        id: {
          [Op.in]: cartItems,
        },
      },
    });

    return res.status(204).end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = WipeItemsFromCart;
