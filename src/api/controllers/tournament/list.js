const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const isTeamPaid = require('../../utils/isTeamPaid');


/**
 * GET /tournaments
 *
 * Params: {
 *  paidOnly: bool. Return paid teams only
 *  notFull: bool. Don't return full teams
 * }
 *
 * Response:
 * [
 *   [Tournament]
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
            attributes: ['username'],
          },
        }],
      });

      tournaments = await Promise.all(tournaments.map(async (tournament) => {
        let teams = await Promise.all(tournament.teams.map(async (team) => {
          let isPaid = true;
          let notFull = true;
          if (req.query.paidOnly === 'true') {
            isPaid = await isTeamPaid(req, team, null, tournament.playersPerTeam);
          }
          if (req.query.notFull === 'true') {
            notFull = team.users.length < tournament.playersPerTeam;
          }
          return (isPaid && notFull ? team.toJSON() : 'empty');
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
