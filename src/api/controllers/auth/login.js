const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const log = require('../../utils/log.js')(module);
const errorHandler = require('../../utils/errorHandler');
const hasCartPaid = require('../../utils/hasCartPaid');
const validateBody = require('../../middlewares/validateBody');

const CheckLogin = [
  check('username').exists(),
  check('password').exists(),
  validateBody(),
];

/**
 * Authenticate a user based on his email/username and password
 * PUT /user/login
 * {
 *    username: String
 *    password: String
 * }
 *
 * Response:
 * {
 *    user: User,
 *    token: String
 * }
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Login = (userModel, teamModel, cartModel, cartItemModel) => async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user
    const user = await userModel.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
      },
      include: {
        model: teamModel,
        attributes: ['id', 'name'],
      },
    });

    const validCredentials = user && await bcrypt.compare(
      password,
      user.password,
    );

    if (!validCredentials) {
      log.warn(`invalid credentials for ${username}`);

      return res
        .status(400)
        .json({ error: 'INVALID_CREDENTIALS' })
        .end();
    }

    // Check if account is activated
    if (user.registerToken) {
      log.warn(`user ${username} tried to login before activating`);

      return res
        .status(400)
        .json({ error: 'USER_NOT_ACTIVATED' })
        .end();
    }

    // Generate new token
    const token = jwt.sign(
      { id: user.id },
      process.env.ARENA_API_SECRET,
      {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      },
    );
    const isPaid = await hasCartPaid(user, cartModel, cartItemModel);

    log.info(`user ${user.username} logged`);

    return res
      .status(200)
      .json({
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          team: user.team,
          type: user.type,
          permissions: user.permissions,
          isPaid,
          place: user.place,
        },
        token,
      })
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { Login, CheckLogin };
