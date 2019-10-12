const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isCaptain = require('../../middlewares/isCaptain');
const isType = require('../../middlewares/isType');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /teams/:teamId/users
 * {
 *   userId: UUID
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/teams/:teamId/users', [
    isAuth(),
    isCaptain(),
    isType('player'),
  ]);

  app.post('/teams/:teamId/users', [
    check('userId')
      .isUUID(),
    validateBody(),
  ]);

  app.post('/teams/:teamId/users', async (req, res) => {
    try {
      const { User, Team, Tournament } = req.app.locals.models;
      const team = await Team.findByPk(req.params.teamId, {
        include: [{
          model: User,
          attributes: ['id'],
        }, {
          model: Tournament,
          attributes: ['playersPerTeam'],
        }],
      });
      const user = await User.findByPk(req.body.userId, {
        where: {
          askingTeamId: team.id,
        },
      });

      if (team && team.users.length === team.tournament.playersPerTeam) {
        return res.status(400).json({ error: 'TEAM_FULL' }).end();
      }
      if (!user) {
        return res.status(404).json({ error: 'NOT_ASKING_USER' }).end();
      }

      user.teamId = team.id;
      user.askingTeamId = null;
      user.type = 'player';
      await user.save();

      log.info(`user ${req.user.username} accepted user ${user.username}`);

      return res
        .status(201)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
