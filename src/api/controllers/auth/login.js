const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');


const log = require('../../utils/log')(module);
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

/**
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
 */
module.exports = (app) => {
  app.post('/auth/login', [
    check('username')
      .trim()
      .isLength({ min: 3, max: 100 }),
    check('password')
      .isLength({ min: 6 }),
    validateBody(),
  ]);

  app.post('/auth/login', async (req, res) => {
    const { User, Team, Cart, CartItem } = req.app.locals.models;

    try {
      const { username, password } = req.body;

      // Get user
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: username }],
        },
        include: {
          model: Team,
          attributes: ['id', 'name'],
        },
      });

      if (!user) {
        log.warn(`user ${username} couldn't be found`);

        return res
          .status(400)
          .json({ error: 'USERNAME_NOT_FOUND' })
          .end();
      }

      // Check for password
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        log.warn(`user ${username} password didn't match`);

        return res
          .status(400)
          .json({ error: 'INVALID_PASSWORD' })
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
      const token = jwt.sign({ id: user.id }, process.env.ARENA_API_SECRET, {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      });

      const hasCartPaid = await Cart.count({
        where: {
          transactionState: 'paid',
        },
        include: [{
          model: CartItem,
          where: {
            itemId: user.type === 'visitor' ? ITEM_VISITOR_ID : ITEM_PLAYER_ID,
            forUserId: user.id,
          },
        }],
      });
      const isPaid = !!hasCartPaid;

      log.info(`user ${user.username} logged`);

      return res
        .status(200)
        .json(
          {
            user: {
              id: user.id,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              team: user.team,
              type: user.type,
              isPaid,
            },
            token,
          },
        )
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
