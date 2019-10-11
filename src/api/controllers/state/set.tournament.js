const { check } = require('express-validator');
const isRespo = require('../../middlewares/isRespo');
const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const validateBody = require('../../middlewares/validateBody');

/**
 * PUT /states/:id
 *
 * Response:
 * [
 *
 * ]
 */
module.exports = (app) => {
  app.put('/states/:id', [isAuth(), isRespo()]);
  app.put('/states/:id', [
    check('value')
      .exists()
      .matches(/\d/),
    validateBody(),
  ]);
  app.put('/states/:id', async (req, res) => {
    const { Spotlight } = req.app.locals.models;

    try {
      const { value } = req.body;
      const spotlightId = req.params.id;

      const spotlight = await Spotlight.findByPk(spotlightId);
      if (!spotlight) {
        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      spotlight.state = value;
      await spotlight.save();

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
