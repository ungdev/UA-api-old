const { Op } = require('sequelize');
const { check } = require('express-validator');

const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

/**
 * GET /users
 * Query Params: {
 *    email: String
 * }
 *
 * Response
 * {
 *   [User]
 * }
 */
module.exports = (app) => {
  app.get('/users', [isAuth()]);

  app.get('/users', [
    check('email')
      .isEmail(),
    validateBody(),
  ]);

  app.get('/users', async (req, res) => {
    const { User, Team, Tournament, Cart, CartItem } = req.app.locals.models;

    try {
      const user = await User.findOne({
        attributes: ['id', 'username', 'firstname', 'lastname', 'type'],
        where: {
          email: req.query.email,
        },
        include: {
          model: Team,
          attributes: ['name'],
          include: {
            model: Tournament,
            attributes: ['name', 'shortName'],
          },
        },
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: 'USER_NOT_FOUND' })
          .end();
      }

      const isPaid = await Cart.count({
        where: {
          transactionState: 'paid',
        },
        include: [{
          model: CartItem,
          where: {
            forUserId: user.id,
            itemId: {
              [Op.in]: [ITEM_PLAYER_ID, ITEM_VISITOR_ID],
            },
          },
        }],
      });
      const noTeam = user.team === null && user.type === 'player';
      const isNone = user.type === 'none';
      if (isPaid) {
        return res
          .status(400)
          .json({ error: 'ALREADY_PAID' })
          .end();
      }
      if (isNone) {
        return res
          .status(400)
          .json({ error: 'NO_TYPE' })
          .end();
      }
      if (noTeam) {
        return res
          .status(400)
          .json({ error: 'NO_TEAM' })
          .end();
      }

      return res
        .status(200)
        .json(user)
        .end();
    }

    catch (error) {
      return errorHandler(error, res);
    }
  });
};