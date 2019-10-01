const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const isCaptain = require('../../middlewares/isCaptain');

/**
 * DELETE /teams/:id
 *
 * Response:
 */
module.exports = (app) => {
  app.delete('/teams/:id', [isAuth(), isCaptain()]);

  app.delete('/teams/:id', async (req, res) => {
    const { Team } = req.app.locals.models;

    try {
      const team = await Team.findByPk(req.params.id);
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
