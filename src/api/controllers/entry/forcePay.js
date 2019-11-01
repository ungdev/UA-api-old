const { fn } = require('sequelize');

const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;
/**
 * Get a user based on its id
 *
 * POST /entry/forcePay/:userId
 * {
 *
 * }
 *
 * Response
 * {
 *
 * }
 *
 * @param {string} userIdString
 * @param {object} userModel
 * @param {object} CartModel
 * @param {object} CartItemModel
 */
const ForcePay = (userIdString, userModel, cartModel, cartItemModel) => async (request, response) => {
  try {
    const userId = request.params[userIdString];

    const user = await userModel.findByPk(userId);
    const itemId = user.type === 'player' ? ITEM_PLAYER_ID : ITEM_VISITOR_ID;

    if (!user) {
      return response
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }

    const cart = await cartModel.create({
      userId,
      transactionState: 'paid',
      paidAt: fn('NOW'),
    });

    await cartItemModel.create({
      userId,
      forUserId: userId,
      cartId: cart.id,
      itemId,
      quantity: 1,
    });

    return response
      .status(204)
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = ForcePay;