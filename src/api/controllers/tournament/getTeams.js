const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const isTeamPaid = require('../../utils/isTeamPaid');


/**
 * GET /tournaments/:id/teams
 *
 * Params: {
 *  onlyPaid: true Display only full team paid
 * }
 *
 * Response:
 * [
 *  [Team]
 * ]
 */

module.exports = (app) => {
  app.get('/tournaments/:id/teams', [isAuth()]);
  app.get('/tournaments/:id/teams', async (req, res) => {
    const { Team, User, Tournament } = req.app.locals.models;

    try {
      let teams = await Team.findAll({
        where: {
          tournamentId: req.params.id,
        },
        include: [{
          model: User,
          attributes: ['id', 'username', 'firstname', 'lastname'],
        }, {
          model: Tournament,
          attributes: ['playersPerTeam'],
        }],
      });
      teams = await Promise.all(teams.map(async (team) => {
        let isPaid = true;
        if (req.query.paidOnly === 'true') {
          isPaid = await isTeamPaid(req, team, null, team.tournament.playersPerTeam);
        }
        return (isPaid ? {
          ...team.toJSON(),
          users: team.users.map(({ username, firstname, lastname }) => (
            { username, firstname, lastname }
          )),
          tournament: undefined,
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
