const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * Get one specific item from a specified cart
 * GET /carts/:cartId/cartItems
 * {
 *
 * }
 * Response
 * {
 *   CartItem
 * }
 *
 * @param {string} cartIdString the cart id name to look for in the route parameter
 * @param {string} itemIdString the item id name to look for in the route parameter
 * @param {object} cartItemModel the cart model to query
 * @param {object} itemModel the item model to query
 * @param {object} attributeModel the attribute model to query
 */
const GetItemFromCart = (
    cartIdString,
    itemIdString,
    cartItemModel,
    itemModel,
    attributeModel
) => {
    return async (req, res) => {
        const cartId = req.params[cartIdString];
        const itemId = req.params[itemIdString];
        try {
            const cartItem = await cartItemModel.findOne({
                where: {
                    id: itemId,
                    userId: req.user.id,
                    cartId: cartId,
                },
                attributes: ['id', 'quantity', 'forUserId'],
                include: [
                    {
                        model: itemModel,
                        attributes: ['name', 'key', 'price', 'stock', 'infos'],
                    },
                    {
                        model: attributeModel,
                        attributes: ['label', 'value'],
                    },
                ],
            });

            if (!cartItem) {
                return res
                    .status(404)
                    .json({ error: 'NOT_FOUND' })
                    .end();
            }

            return res
                .status(200)
                .json(cartItem)
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = GetItemFromCart;
