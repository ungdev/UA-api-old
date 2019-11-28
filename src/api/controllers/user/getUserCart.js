const errorHandler = require('../../utils/errorHandler');
const deleteExpireCarts = require('../../utils/deleteExpireCarts');

/**
 * GET /users/:userId/carts/current
 * {
 *
 * }
 * Response
 * {
 *   Cart
 * }
 *   @param {string} userIdString the name of the id to look for in the route parameter
 *   @param {object} cartModel the model to query
 *   @param {object} itemModel, the item model to query
 *   @param {object} cartItemModel, the cart model to query
 *   @param {object} attributeModel, the attribute model to query
 *   @param {object} userModel the user model to query
 */
const GetUserCart = (
  userIdString,
  cartModel,
  itemModel,
  cartItemModel,
  attributeModel,
  userModel,
) => async (req, res) => {
  const userId = req.params[userIdString];
  deleteExpireCarts(cartModel);
  try {
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }

    const cart = await cartModel.findOne({
      attributes: ['id', 'paidAt', 'transactionId', 'transactionState'],
      where: {
        userId,
        transactionState: 'draft',
      },

      include: {
        model: cartItemModel,
        attributes: ['id', 'quantity', 'forUserId'],
        include: [
          {
            model: itemModel,
            attributes: ['id', 'name', 'key', 'price', 'stock', 'infos'],
          },
          {
            model: attributeModel,
            attributes: ['label', 'value', 'id'],
          },
        ],
      },
    });

    // Parse sequelize entity to plain object
    // https://stackoverflow.com/questions/21961818/sequelize-convert-entity-to-plain-object
    const resCart = JSON.parse(JSON.stringify(cart));

    if (resCart && resCart.cartItems) {
      await Promise.all(
        resCart.cartItems.map(async (item, i) => {
          const forUser = await userModel.findByPk(item.forUserId);
          resCart.cartItems[i].forEmail = forUser.email;
        }),
      );
    }

    return res
      .status(200)
      .json(resCart)
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = GetUserCart;
