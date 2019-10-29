const errorHandler = require('../../utils/errorHandler');

const ticketId = 1;
/**
 * Return the user's team. The user should be in the team, other wise
 * he cannot access this infos
 *
 * GET /teams/:id
 *
 * @param {string} teamidString name of the id to get from the url
 * @param {object} teamModel model for Team
 * @param {object} userModel model for User
 * @param {object} tournamentModel model for  Tournament
 * @param {object} cartModel model for Cart
 * @param {object} cartItemModel model for CartItem
 */
const Get = (
    teamIdString,
    teamModel,
    userModel,
    tournamentModel,
    cartModel,
    cartItemModel
) => {
    return async (req, res) => {
        const teamId = req.params[teamIdString];
        try {
            const team = await teamModel.findOne({
                where: {
                    id: teamId,
                },
                include: [
                    {
                        model: userModel,
                        attributes: ['username', 'email', 'id'],
                    },
                    {
                        model: tournamentModel,
                    },
                ],
            });
            // TODO: C'est moche je pense avec sequelize on peut faire mieux
            let askingUsers = await userModel.findAll({
                where: { askingTeamId: teamId },
            });
            if (team) {
                const users = await Promise.all(
                    team.users.map(async ({ username, email, id }) => {
                        const isCartPaid = await cartModel.count({
                            where: {
                                transactionState: 'paid',
                            },
                            include: [
                                {
                                    model: cartItemModel,
                                    where: {
                                        forUserId: id,
                                        itemId: ticketId,
                                    },
                                },
                            ],
                        });
                        return { username, id, isPaid: !!isCartPaid };
                    })
                );
                askingUsers = askingUsers.map(({ username, email, id }) => ({
                    username,
                    email,
                    id,
                }));
                return res
                    .status(200)
                    .json({ ...team.toJSON(), users, askingUsers })
                    .end();
            }
            return res
                .status(404)
                .json({ error: 'NOT_FOUND' })
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = Get;
