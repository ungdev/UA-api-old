const { Op } = require('sequelize');
const { check } = require('express-validator');

const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

const CheckList = [check('email').isEmail(), validateBody()];

/**
 * Get the user list
 * GET /users
 * Query Params: {
 *    email: String
 * }
 *
 * Response
 * {
 *   [User]
 * }
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} tournamentModel
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const List = (
    userModel,
    teamModel,
    tournamentModel,
    cartModel,
    cartItemModel
) => {
    return async (req, res) => {
        try {
            const user = await userModel.findOne({
                attributes: ['id', 'username', 'firstname', 'lastname', 'type'],
                where: {
                    email: req.query.email,
                },
                include: {
                    model: teamModel,
                    attributes: ['name'],
                    include: {
                        model: tournamentModel,
                        attributes: ['name', 'shortName'],
                    },
                },
            });

            if (!user) {
                return res
                    .status(404)
                    .json({ error: 'USER_NOT_FOUND' })
                    .end();
            }

            const isPaid = await cartModel.count({
                where: {
                    transactionState: 'paid',
                },
                include: [
                    {
                        model: cartItemModel,
                        where: {
                            forUserId: user.id,
                            itemId: {
                                [Op.in]: [ITEM_PLAYER_ID, ITEM_VISITOR_ID],
                            },
                        },
                    },
                ],
            });
            const noTeam = user.team === null && user.type === 'player';
            const isNone = user.type === 'none';
            if (isPaid) {
                return res
                    .status(400)
                    .json({ error: 'ALREADY_PAID' })
                    .end();
            }
            if (isNone) {
                return res
                    .status(400)
                    .json({ error: 'NO_TYPE' })
                    .end();
            }
            if (noTeam) {
                return res
                    .status(400)
                    .json({ error: 'NO_TEAM' })
                    .end();
            }

            return res
                .status(200)
                .json(user)
                .end();
        } catch (error) {
            return errorHandler(error, res);
        }
    };
};

module.exports = { List, CheckList };
