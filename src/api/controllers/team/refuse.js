const { check } = require('express-validator/check');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isInTeam = require('../../middlewares/isInTeam');
const isCaptain = require('../../middlewares/isCaptain');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /team/:id/refuse
 * {
 *   user: String
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/team/:id/refuse', [
    isAuth('team-refuse'),
    isInTeam('team-refuse'),
    isCaptain('team-refuse'),
  ]);

  app.post('/team/:id/refuse', [
    check('user')
      .exists()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/team/:id/refuse', async (req, res) => {
    try {
      const user = await req.app.locals.models.User.findByPk(req.body.user);

      await req.app.locals.models.AskingUser.destroy({
        where: {
          userId: user.id,
          teamId: req.params.id,
        },
      });

      log.info(`user ${req.user.name} refused user ${user.name}`);

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
