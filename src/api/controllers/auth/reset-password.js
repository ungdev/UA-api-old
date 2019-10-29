const uuid = require('uuid');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);
const { sendMail, reset } = require('../../mail');
//const sendMail = require('../../mail/reset');

const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');

const CheckReset = [
    check('email')
        .isEmail()
        .exists(),
    validateBody(),
];

/**
 * Ask for a password reset. It will generate a reset token
 * which have to be used with the `change-password` route
 * POST /auth/reset
 * {
 *    email: String
 * }
 *
 * Response:
 * {
 *
 * }
 *
 * PUT /auth/reset
 * {
 *    token: String,
 *    password: String
 * }
 * @param {object} userModel
 */
const ResetPassword = userModel => async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ where: { email } });

        if (!user) {
            log.warn(`can not reset ${email}, user not found`);

            return res
                .status(400)
                .json({ error: 'INVALID_EMAIL' })
                .end();
        }

        await user.update({
            resetToken: uuid(),
        });

        await sendMail(reset, user.email, {
            username: user.username,
            link: `${process.env.ARENA_WEBSITE}}/password/change/${user.resetToken}`,
        });

        log.info(`user ${user.username} asked for mail reset`);

        return res.status(204).end();
    } catch (err) {
        return errorHandler(err, res);
    }
};

module.exports = { ResetPassword, CheckReset };
