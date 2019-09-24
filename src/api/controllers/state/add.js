const { check } = require('express-validator/check');
const isRespo = require('../../middlewares/isRespo');
const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const validateBody = require('../../middlewares/validateBody');
const log = require('../../utils/log')(module);

/**
 * GET /users
 *
 * Response:
 * [
 *
 * ]
 */
module.exports = (app) => {
  app.post('/states/:id', [isAuth(), isRespo()]);

  app.post('/states/:id', [
    check('title')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('desc')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('popover'),
    validateBody(),
  ]);

  app.post('/states/:id', async (req, res) => {
    const { State, Spotlight } = req.app.locals.models;

    try {
      const spotlightId = req.params.id;
      const { title, desc, popover } = req.body;

      const spotlight = await Spotlight.findByPk(spotlightId);
      if (!spotlight) {
        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      const state = await State.create({
        title,
        desc,
        popover: popover || '',
      });

      await spotlight.addState(state);
      await spotlight.save();

      return res
        .status(200)
        .json(state)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
