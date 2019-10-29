const errorHandler = require('../../utils/errorHandler');

/**
 * Create a empty cart for one user. It is mandatory prior for the user to add items.
 * POST /users/:userID/carts
 * {
 *
 * }
 * Response
 * {
 *
 * }
 * @param {object} cartModel
 */
const CreateCart = cartModel => async (req, res) => {
    try {
        const draftCount = await cartModel.count({
            where: {
                userId: req.user.id,
                transactionState: 'draft',
            },
        });

        if (draftCount !== 0) {
            return res
                .status(400)
                .json({ error: 'DUPLICATE_ENTRY' })
                .end();
        }

        const cart = await cartModel.create({ userId: req.user.id });

        return res
            .status(200)
            .json(cart)
            .end();
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = CreateCart;
