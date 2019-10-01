const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * DELETE /teams/:id/request
 * {
 *    user: UUID
 * }
 *
 * Response:
 * {}
 */
module.exports = (app) => {
  app.delete('/teams/:id/request', [isAuth()]);

  app.delete('/teams/:id/request', [
    check('user')
      .isUUID(),
    validateBody(),
  ]);

  app.delete('/teams/:id/request', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      if (req.user.askingTeamId === req.params.id && req.body.user === req.user.id) {
        req.user.askingTeamId = null;
        await req.user.save();

        log.info(`user ${req.user.username} cancel request to team ${req.params.id}`);

        return res
          .status(200)
          .end();
      }

      if (req.user.id !== req.user.team.captainId) {
        return res
          .status(400)
          .json({ error: 'NO_CAPTAIN' });
      }

      const user = await User.findOne({
        where: {
          askingTeamId: req.params.id,
          id: req.body.user,
        },
      });
      user.askingTeamId = null;
      await user.save();
      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
