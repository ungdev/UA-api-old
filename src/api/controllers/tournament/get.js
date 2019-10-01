const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const isTeamPaid = require('../../utils/isTeamPaid');

/**
 * GET /tournaments/:id
 *
 * Params: {
 *  onlyPaid: true Display only full team paid
 * }
 *
 * Response:
 * [Tournament]
 */

module.exports = (app) => {
  app.get('/tournaments/:id', [isAuth()]);
  app.get('/tournaments/:id', async (req, res) => {
    const { Tournament, Team, User } = req.app.locals.models;

    try {
      const tournament = await Tournament.findByPk(req.params.id, {
        include: [
          {
            model: Team,
            include: [{
              model: User,
              attributes: ['id'],
            }],
          },
        ],
      });
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
      return res
        .status(200)
        .json({
          ...tournament.toJSON(),
          teams,
        })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
