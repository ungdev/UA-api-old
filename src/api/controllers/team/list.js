const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const isTeamPaid = require('../../utils/isTeamPaid');

/**
 * GET /teams
 *
 * Params: {
 *  onlyPaid: true Display only full team paid
 * }
 *
 * Response:
 * [Team]
 */
module.exports = (app) => {
  app.get('/teams', [isAuth()]);

  app.get('/teams', async (req, res) => {
    const { Team, User, Tournament } = req.app.locals.models;

    try {
      let tournaments;
      let teams = await Team.findAll({
        include: [{
          model: User,
        }],
        order: [
          ['name', 'ASC'],
        ],
      });
      if (req.query.paidOnly === 'true') {
        tournaments = await Tournament.findAll({
          attributes: ['playersPerTeam', 'id'],
        });
      }
      teams = await Promise.all(teams.map(async (team) => {
        let isPaid = true;
        if (req.query.paidOnly === 'true') {
          isPaid = await isTeamPaid(req, team, tournaments);
        }
        return (isPaid ? {
          ...team.toJSON(),
          users: team.users.map((user) => ({
            id: user.id,
            name: user.username,
            isCaptain: user.id === team.captainId,
          })),
        } : 'empty');
      }));
      teams = teams.filter((team) => team !== 'empty');
      return res
        .status(200)
        .json(teams)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
