const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const hash = require('util').promisify(bcrypt.hash);

const validateBody = require('../../middlewares/validateBody');
const mail = require('../../mail');
const randomBarcode = require('../../utils/randomBarcode');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log.js')(module);

const CheckRegister = [
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
  check('email').isEmail(),
  check('password').isLength({ min: 6 }),
  validateBody(),
];

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
const Register = (userModel) => async (req, res) => {
  try {
    req.body.barcode = randomBarcode();
    req.body.password = await hash(
      req.body.password,
      parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
    );

    req.body.registerToken = uuid();
    const user = await userModel.create(req.body);

    await mail.sendMail(mail.register, user.email, {
      username: user.username,
      button_link: `${process.env.ARENA_WEBSITE}/valid/${user.registerToken}`,
    });

    log.info(`user ${req.body.username} created`);

    return res.status(204).end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { Register, CheckRegister };
