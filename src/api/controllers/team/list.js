const errorHandler = require('../../utils/errorHandler');

/**
 * Get all the teams registered
 * GET /teams
 *
 * Params: {
 *  onlyPaid: true Display only full team paid
 * }
 *
 * Response:
 * [Team]
 * @param {object} teamModel
 * @param {object} tournamentModel
 * @param {object} userModel
 */
const List = (teamModel, tournamentModel, userModel) => {
    return async (req, res) => {
        try {
            let tournaments;
            let teams = await teamModel.findAll({
                include: [
                    {
                        model: userModel,
                    },
                ],
                order: [['name', 'ASC']],
            });
            if (req.query.paidOnly === 'true') {
                tournaments = await tournamentModel.findAll({
                    attributes: ['playersPerTeam', 'id'],
                });
            }
            teams = await Promise.all(
                teams.map(async team => {
                    let isPaid = true;
                    if (req.query.paidOnly === 'true') {
                        isPaid = await isTeamPaid(req, team, tournaments);
                    }
                    return isPaid
                        ? {
                              ...team.toJSON(),
                              users: team.users.map(user => ({
                                  id: user.id,
                                  name: user.username,
                                  isCaptain: user.id === team.captainId,
                              })),
                          }
                        : 'empty';
                })
            );
            teams = teams.filter(team => team !== 'empty');
            return res
                .status(200)
                .json(teams)
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = List;
