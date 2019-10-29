const { check } = require('express-validator');

const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

const CheckEdit = [
    check('quantity').isInt(),
    check('attributeId')
        .optional()
        .isInt(),
    check('forUserId')
        .optional()
        .isUUID(),
    validateBody(),
];

/**
 * Allow to edit an item inside a created cart.
 * Setting quantity to 0 is equivalent to delete the item from the cart.
 * PUT /carts/:cartId/cartItems/:id
 * {
 *  quantity: int
 *  attributeId: int, optionnal
 *  forUserId: UUID, optionnal. For self if null
 * }
 * Response
 * {
 *
 * }
 * @param {string} cartIdString the id name for cart to look for in the route parameter
 * @param {string} itemIdString the id name for item to look for in the route parameter
 * @param {object}  cartItemModel the model to query for item
 * @param {object}  userModel the model to query for user
 */
const Edit = (cartIdString, itemIdString, cartItemModel, userModel) => {
    return async (req, res) => {
        const cartId = req.params[cartIdString];
        const itemId = req.params[itemIdString];
        const quantity = req.body.quantity;
        try {
            const cartItem = await cartItemModel.findOne({
                where: {
                    id: itemId,
                    userId: req.user.id,
                    cartId: cartId,
                },
            });

            if (quantity === 0) {
                cartItem.destroy();
                return res.status(204).end();
            }

            if (!cartItem) {
                return res
                    .status(404)
                    .json({ error: 'ITEM_NOT_FOUND' })
                    .end();
            }

            if (req.body.forUserId) {
                const user = await userModel.findOne(req.body.forUserId);
                if (!user) {
                    return res
                        .status(404)
                        .json({ error: 'USER_NOT_FOUND' })
                        .end();
                }
            } else req.body.forUserId = req.user.id;

            cartItem.forUserId = req.body.forUserId;
            cartItem.quantity = quantity;
            cartItem.attributeId = req.body.attributeId;

            // Attention: pas de verification d'attribute si ça peut correspondre à un itemId
            // Est-ce utile ?
            await cartItem.save();

            return res.status(204).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { Edit, CheckEdit };
