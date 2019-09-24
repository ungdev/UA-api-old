const isAuth = require('../../middlewares/isAuth');
const isInTeam = require('../../middlewares/isInTeam');
const isCaptain = require('../../middlewares/isCaptain');
const log = require('../../utils/log')(module);
const errorHandler = require('../../utils/errorHandler');

/**
 * POST /spotlight/:id/leave
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
  app.post('/spotlight/:id/leave', [
    isAuth('spotlight-leave'),
    isInTeam('spotlight-leave'),
    isCaptain('spotlight-leave'),
  ]);

  app.post('/spotlight/:id/leave', async (req, res) => {
    try {
      await req.user.team.update({
        spotlightId: null,
      });

      log.info(`${req.user.name} left team ${req.user.team.name}`);

      if (req.user.team.soloTeam) {
        await req.user.team.destroy();
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
