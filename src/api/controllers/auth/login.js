const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const log = require('../../utils/log')(module);
const errorHandler = require('../../utils/errorHandler');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

const CheckLogin = [
    check('username').exists(),
    check('password').exists(),
    validateBody(),
];

/**
 * Authenticate a user based on his email/username and password
 * PUT /user/login
 * {
 *    username: String
 *    password: String
 * }
 *
 * Response:
 * {
 *    user: User,
 *    token: String
 * }
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Login = (userModel, teamModel, cartModel, cartItemModel) => {
    return async (req, res) => {
        try {
            const { username, password } = req.body;

            // Get user
            const user = await userModel.findOne({
                where: {
                    [Op.or]: [{ username }, { email: username }],
                },
                include: {
                    model: teamModel,
                    attributes: ['id', 'name'],
                },
            });

            if (!user) {
                log.warn(`user ${username} couldn't be found`);

                return res
                    .status(400)
                    .json({ error: 'USERNAME_NOT_FOUND' })
                    .end();
            }

            // Check for password
            const passwordMatches = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatches) {
                log.warn(`user ${username} password didn't match`);

                return res
                    .status(400)
                    .json({ error: 'INVALID_PASSWORD' })
                    .end();
            }

            // Check if account is activated
            if (user.registerToken) {
                log.warn(`user ${username} tried to login before activating`);

                return res
                    .status(400)
                    .json({ error: 'USER_NOT_ACTIVATED' })
                    .end();
            }

            // Generate new token
            const token = jwt.sign(
                { id: user.id },
                process.env.ARENA_API_SECRET,
                {
                    expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
                }
            );

            const hasCartPaid = await cartModel.count({
                where: {
                    transactionState: 'paid',
                },
                include: [
                    {
                        model: cartItemModel,
                        where: {
                            itemId:
                                user.type === 'visitor'
                                    ? ITEM_VISITOR_ID
                                    : ITEM_PLAYER_ID,
                            forUserId: user.id,
                        },
                    },
                ],
            });
            const isPaid = !!hasCartPaid;

            log.info(`user ${user.username} logged`);

            return res
                .status(200)
                .json({
                    user: {
                        id: user.id,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        team: user.team,
                        type: user.type,
                        isPaid,
                    },
                    token,
                })
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { Login, CheckLogin };
