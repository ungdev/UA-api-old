const { check } = require('express-validator');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

/**
 * PUT /teams/:id
 *
 * {
 *   captainId: UUID
 * }
 *
 * Response:
 *  {}
 */
module.exports = (app) => {
  app.put('/teams/:id', [isAuth()]);

  app.put('/teams/:id', [
    check('captainId')
      .exists()
      .isUUID(),
    validateBody(),
  ]);

  app.put('/teams/:id', async (req, res) => {
    const { Team } = req.app.locals.models;

    try {
      const team = await Team.findOne({
        where: {
          captainId: req.user.id,
          id: req.params.id,
        },
      });
      if (!team) {
        return res
          .status(400)
          .json({ error: 'BAD_REQUEST' })
          .end();
      }
      await team.setCaptain(req.body.captainId);
      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
