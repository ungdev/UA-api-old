const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

const validateBody = require('../../middlewares/validateBody');
const { outputFields } = require('../../utils/publicFields');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /user/validate
 * {
 *    email: String
 * }
 *
 * Response:
 * {
 *    token: String
 * }
 *
 */
module.exports = (app) => {
  app.post('/user/validate', [
    check('slug')
      .exists()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/user/validate', async (req, res) => {
    const { User } = req.app.locals.models;
    const registerToken = req.body.slug;

    try {
      const user = await User.findOne({ where: { registerToken } });

      if (!user) {
        log.warn(`can not validate ${registerToken}, user not found`);

        return res
          .status(400)
          .json({ error: 'INVALID_TOKEN' })
          .end();
      }

      await user.update({
        registerToken: null,
      });

      log.info(`user ${user.username} was validated`);

      const token = jwt.sign({ id: user.id }, process.env.ARENA_API_SECRET, {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      });

      log.info(`user ${user.username} logged`);

      return res
        .status(200)
        .json({ user: outputFields(user), token })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
