const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isCaptain = require('../../middlewares/isCaptain');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * DELETE /teams/:teamId/request
 * {
 *    user: UUID
 * }
 *
 * Response:
 * {}
 */
module.exports = (app) => {
  app.delete('/teams/:teamId/request', [
    isAuth(),
    isCaptain(),
  ]);

  app.delete('/teams/:teamId/request', [
    check('user')
      .isUUID(),
    validateBody(),
  ]);

  app.delete('/teams/:teamId/request', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      if (req.user.askingTeamId === req.params.teamId && req.body.user === req.user.teamId) {
        req.user.askingTeamId = null;
        await req.user.save();

        log.info(`user ${req.user.username} cancel request to team ${req.params.id}`);

        return res
          .status(200)
          .end();
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
