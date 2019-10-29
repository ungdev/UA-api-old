const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * Delete a specified item from a specified cart
 * DELETE /carts/:cartId/cartItems/:id
 * {
 *
 * }
 * Response
 * {
 *
 * }
 * @param {string} cartIdString the name of the cartId parameter in the url
 * @param {string} itemIdString the name of the itemId parameter in the url
 * @param {object} cartItemModel the cart model to query
 */

const DeleteItemFromCart = (cartIdString, itemIdString, cartItemModel) => {
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
            });

            if (!cartItem) {
                return res
                    .status(404)
                    .json({ error: 'ITEM_NOT_FOUND' })
                    .end();
            }

            await cartItem.destroy();

            return res.status(204).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = DeleteItemFromCart;
