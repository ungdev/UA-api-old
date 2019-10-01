const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * DELETE /teams/:id/users/:userId
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
  app.delete('/teams/:id/users/:userId', [isAuth()]);

  app.delete('/teams/:id/users/:userId', async (req, res) => {
    const { User, Team } = req.app.locals.models;

    // is captain or self-kick (= leave), else deny
    if (req.user.team.captainId !== req.user.id && req.user.id !== req.params.userId) {
      log.warn(`user ${req.user.name} tried to kick without being captain`);

      return res
        .status(403)
        .json({ error: 'NO_CAPTAIN' })
        .end();
    }

    try {
      const user = await User.findOne({
        where: {
          id: req.params.userId,
          teamId: req.params.id,
        },
        include: [Team],
      });

      if (!user) {
        log.warn(`user ${req.user.username} tried to kick someone but he was not in the team`);

        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      if (user.team.captainId === req.params.userId) {
        log.info('Impossible to delete captain user');
        return res
          .status(403)
          .json({ error: 'CAPTAIN' })
          .end();
      }
      if (user.team.captainId === req.user.id || req.params.userId === req.user.id) {
        user.teamId = null;
        await user.save();
        return res
          .status(200)
          .end();
      }
      return res
        .status(401)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
