const isAuth = require('../../middlewares/isAuth');
const isInTeam = require('../../middlewares/isInTeam');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /team/:id/kick/:userId
 * {
 *
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/team/kick/:id', [isAuth('team-kick'), isInTeam('team-kick')]);

  app.post('/team/kick/:id', async (req, res) => {
    const { User } = req.app.locals.models;

    // is captain or self-kick (= leave), else deny
    if (req.user.team.captainId !== req.user.id && req.user.id !== req.params.id) {
      log.warn(`user ${req.user.name} tried to kick without being captain`);

      return res
        .status(401)
        .json({ error: 'NO_CAPTAIN' })
        .end();
    }

    try {
      const user = await User.findOne({
        where: {
          id: req.params.id,
          teamId: req.user.team.id,
        },
      });

      if (!user) {
        log.warn(`user ${req.user.name} tried to kick someone but he was not in the team`);

        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      if (req.user.team.captainId === req.params.id) {
        log.info(`user ${req.user.name} left ${req.user.team.name} and destroyed it, as captain`);
        const users = await User.findAll({ where: { teamId: req.user.team.id } });
        for (const u of users) {
          await u.update({
            joined_at: null,
            teamId: null,
          });
        }
        await req.user.team.destroy();
      }
      else {
        log.info(`user ${req.user.name} kicked ${user.name}`);
        const u = await User.findByPk(req.params.id, {});
        await u.update({
          joined_at: null,
          teamId: null,
        });
        await req.user.team.removeUser(req.params.id);
      }

      return res
        .status(200)
        .json({})
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
