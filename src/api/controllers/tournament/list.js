const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const isTeamPaid = require('../../utils/isTeamPaid');


/**
 * GET /spotlights
 *
 * Response:
 * [
 *   [Spotlight]
 * ]
 */
module.exports = (app) => {
  app.get('/tournaments', [isAuth()]);
  app.get('/tournaments', async (req, res) => {
    const { Tournament, Team, User } = req.app.locals.models;

    try {
      let tournaments = await Tournament.findAll({
        include: [{
          model: Team,
          include: {
            model: User,
            attribute: ['id'],
          },
        }],
      });

      tournaments = await Promise.all(tournaments.map(async (tournament) => {
        let teams = await Promise.all(tournament.teams.map(async (team) => {
          let isPaid = true;
          if (req.query.paidOnly === 'true') {
            isPaid = await isTeamPaid(req, team, null, tournament.playersPerTeam);
          }
          return (isPaid ? {
            ...team.toJSON(),
            users: undefined,
          } : 'empty');
        }));
        teams = teams.filter((team) => team !== 'empty');
        return {
          ...tournament.toJSON(),
          teams,
        };
      }));

      return res
        .status(200)
        .json(tournaments)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
