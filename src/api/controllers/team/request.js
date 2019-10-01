const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /teams/:id/request
 *
 * Response:
 * {}
 */
module.exports = (app) => {
  app.post('/teams/:id/request', [isAuth()]);

  app.post('/teams/:id/request', async (req, res) => {
    const { Team, User, Tournament } = req.app.locals.models;

    if (req.user.teamId !== null) {
      log.warn(`user ${req.user.name} tried to join team while he already has one`);

      return res
        .status(400)
        .json({ error: 'ALREADY_IN_TEAM' })
        .end();
    }

    try {
      const team = await Team.findByPk(req.params.id, {
        include: [{
          model: User,
          attributes: ['id'],
        }, {
          Model: Tournament,
          attributes: ['playersPerTeam'],
        }],
      });

      if (team.tournament.playersPerTeam === team.users.length) {
        return res
          .status(400)
          .json({ error: 'TEAM_FULL' })
          .end();
      }

      req.user.askingTeamId = req.params.id;
      await req.user.save();

      log.info(`user ${req.user.username} asked to join team ${req.params.id}`);

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
