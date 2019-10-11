const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

/**
 * GET /users/:id
 * {
 *
 * }
 *
 * Response
 * {
 *   User
 * }
 */
// todo: admin chekc
module.exports = (app) => {
  app.get('/users/:id', isAuth());

  app.get('/users/:id', async (req, res) => {
    const { User, Team, Cart, CartItem } = req.app.locals.models;

    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'firstname', 'lastname', 'email', 'askingTeamId', 'type'],
        include: {
          model: Team,
          attributes: ['id', 'name'],
        },
      });

      if (!user) return res.status(404).json({ error: 'NOT_FOUND' }).end();
      if (req.user.id !== user.id) {
        return res.status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

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

      return res
        .status(200)
        .json({ ...user.toJSON(), isPaid })
        .end();
    }

    catch (error) {
      return errorHandler(error, res);
    }
  });
};