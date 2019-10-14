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
    try {
      req.user.type = 'none';
      await req.user.save();
      await req.user.team.destroy();
      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
