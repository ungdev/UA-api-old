const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const hash = require('util').promisify(bcrypt.hash);
const validateBody = require('../../middlewares/validateBody');
const sendMail = require('../../mail/register');

const random = require('../../utils/random');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /users
 * {
 *   firstname: String
 *   lastname: String
 *   username: String
 *   password: String
 *   email: String
 * }
 *
 * Response
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/users', [
    check('username')
      .trim()
      .isLength({ min: 3, max: 100 }),
    check('lastname')
      .trim()
      .isLength({ min: 2, max: 100 }),
    check('firstname')
      .trim()
      .isLength({ min: 2, max: 100 }),
    check('lastname')
      .trim()
      .isLength({ min: 2, max: 100 }),
    check('username')
      .trim()
      .isLength({ min: 3, max: 100 }),
    check('email')
      .isEmail(),
    check('password')
      .isLength({ min: 6 }),
    validateBody(),
  ]);

  app.post('/users', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      req.body.barcode = random(process.env.ARENA_API_BARCODE_LENGTH);
      req.body.password = await hash(req.body.password, parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10));

      req.body.registerToken = uuid();
      const user = await User.create(req.body);

      await sendMail(user.email, {
        username: user.username,
        link: `${process.env.ARENA_WEBSITE}/valid/${user.registerToken}`,
      });

      log.info(`user ${req.body.name} created`);

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
