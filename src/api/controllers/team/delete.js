const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const isCaptain = require('../../middlewares/isCaptain');
const isType = require('../../middlewares/isType');

/**
 * DELETE /teams/:id
 *
 * Response:
 */
module.exports = (app) => {
  app.delete('/teams/:id', [isAuth(), isCaptain(), isType('player')]);

  app.delete('/teams/:id', async (req, res) => {
    const { Team } = req.app.locals.models;
    if (req.params.id !== req.user.teamId) {
      return res
        .status(401)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }
    try {
      const team = await Team.findOne({
        where: {
          id: req.params.id,
          captainId: req.user.id,
        },
      });
      if (!team) {
        return res
          .status(401)
          .json({ error: 'NO_CAPTAIN' })
          .end();
      }
      req.user.type = 'none';
      await req.user.save();
      await team.destroy();
      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
