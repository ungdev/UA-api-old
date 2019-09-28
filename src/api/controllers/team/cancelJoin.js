const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * DELETE /team/:id/cancelRequest
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
  app.delete('/team/:id/cancelRequest', [isAuth('team-cancelRequest')]);

  app.delete('/team/:id/cancelRequest', async (req, res) => {
    try {
      await req.app.locals.models.AskingUser.destroy({
        where: {
          userId: req.user.id,
          teamId: req.params.id,
        },
      });

      log.info(`user ${req.user.name} canceled request to ${req.params.id}`);

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
