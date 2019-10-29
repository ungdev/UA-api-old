const errorHandler = require('../../utils/errorHandler');

/**
 * GET /users/:userId/carts
 * {
 *
 * }
 * Response
 * {
 *   [Cart]
 * }
 * @param {string} userIdString the name of the user id in the route parameter
 * @param {object} cartModel model to query carts
 * @param {object} itemModel model to query items
 * @param {object} cartItemModel model to query cart items
 * @param {object} attributeMode model to query attributes
 */
const ListCartsFromUser = (
  userIdString,
  cartModel,
  itemModel,
  cartItemModel,
  attributeModel,
) => async (req, res) => {
  const userId = req.params[userIdString];
  try {
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }

    const carts = await cartModel.findAll({
      attributes: [
        'id',
        'paidAt',
        'transactionId',
        'transactionState',
      ],
      where: {
        userId,
      },

      include: {
        model: cartItemModel,
        attributes: ['id', 'quantity', 'forUserId'],
        include: [
          {
            model: itemModel,
            attributes: [
              'name',
              'key',
              'price',
              'stock',
              'infos',
            ],
          },
          {
            model: attributeModel,
            attributes: ['label', 'value'],
          },
        ],
      },
    });

    return res
      .status(200)
      .json(carts)
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = ListCartsFromUser;
