const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const validateBody = require('../../middlewares/validateBody');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);
const sendMail = require('../../mail/reset');

/**
 * POST /auth/reset
 * {
 *    email: String
 * }
 *
 * Response:
 * {
 *
 * }
 *
 * PUT /auth/reset
 * {
 *    token: String,
 *    password: String
 * }
 */
module.exports = (app) => {
  app.post('/auth/reset', [
    check('email')
      .isEmail(),
    validateBody(),
  ]);

  app.post('/auth/reset', async (req, res) => {
    const { User } = req.app.locals.models;
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        log.warn(`can not reset ${email}, user not found`);

        return res
          .status(400)
          .json({ error: 'EMAIL_NOT_FOUND' })
          .end();
      }

      await user.update({
        resetToken: uuid(),
      });

      await sendMail(user.email, {
        username: user.username,
        link: `${process.env.ARENA_WEBSITE}/reset/${user.resetToken}`,
      });

      log.info(`user ${user.username} asked for mail reset`);

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });

  app.put('/auth/reset', [
    check('password')
      .isLength({ min: 6 }),
    check('resetToken')
      .isUUID(),
    validateBody(),
  ]);

  app.put('/auth/reset', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      const { resetToken } = req.body;

      const user = await User.findOne({ where: { resetToken } });

      if (!user) {
        log.warn(`can not reset ${resetToken}, token not found`);

        return res
          .status(400)
          .json({ error: 'INVALID_TOKEN' })
          .end();
      }

      user.password = await bcrypt.hash(
        req.body.password,
        parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
      );

      user.resetToken = null;

      await user.save();

      log.info(`user ${user.username} reseted his password`);

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
