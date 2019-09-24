const { check } = require('express-validator/check');
const errorHandler = require('../../utils/errorHandler');
const isRespo = require('../../middlewares/isRespo');
const isAuth = require('../../middlewares/isAuth');
const validateBody = require('../../middlewares/validateBody');

/**
 * POST /infos/:id
 *
 * Response:
 *
 */
module.exports = (app) => {
  app.post('/infos/:id', [
    isAuth(),
    isRespo(),
    check('title')
      .exists(),
    check('content')
      .exists(),
    validateBody(),
  ]);
  app.post('/infos/:id', async (req, res) => {
    const { Info } = req.app.locals.models;

    try {
      const info = await Info.create({
        title: req.body.title,
        content: req.body.content,
        spotlightId: req.params.id,
      });
      return res
        .status(200)
        .json(info)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
