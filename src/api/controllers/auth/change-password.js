const bcrypt = require('bcryptjs');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');

const CheckChangePassword = [
    check('password').isLength({ min: 6 }),
    check('resetToken').isUUID(),
    validateBody(),
];

/**
 * Execute a password update for a user, using a reset token provided
 * by the `reset-password` route
 * @param {*} userModel the user model to query
 */
const ChangePassword = userModel => async (request, response) => {
    try {
        const { resetToken } = request.body;

        const user = await userModel.findOne({ where: { resetToken } });

        if (!user) {
            log.warn(`can not reset ${resetToken}, token not found`);

            return response
                .status(400)
                .json({ error: 'INVALID_TOKEN' })
                .end();
        }

        user.password = await bcrypt.hash(
            request.body.password,
            parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10)
        );

        user.resetToken = null;

        await user.save();

        log.info(`user ${user.username} reseted his password`);

        return response.status(204).end();
    } catch (err) {
        return errorHandler(err, response);
    }
};

module.exports = { ChangePassword, CheckChangePassword };
