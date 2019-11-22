const errorHandler = require('../../utils/errorHandler');

/**
 * Mark a cart as refunded
 * PUT /carts/:cartId
 * {
 *
 * }
 * Response
 * {
 *
 * }
 * @param {string} cartIdString the id name for cart to look for in the route parameter
 * @param {object} cartModel the model to query for cart
 */
const Refund = (cartIdString, cartModel) => async (request, response) => {
  const cartId = request.params[cartIdString];

  try {
    await cartModel.update(
      { transactionState: 'refunded' },
      { where: { id: cartId } },
    );

    return response.status(204).end();
  }
  catch (err) {
    return errorHandler(err, response);
  }
};

module.exports = Refund;
