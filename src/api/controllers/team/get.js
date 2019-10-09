const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

const ticketId = 1;
/**
 * GET /teams/:id
 *
 * Response:
 *  Team
 */
module.exports = (app) => {
  app.get('/teams/:id', [isAuth()]);

  app.get('/teams/:id', async (req, res) => {
    const { Team, User, Tournament, Cart, CartItem } = req.app.locals.models;

    try {
      const team = await Team.findOne({
        where: {
          id: req.params.id,
        },
        include: [{
          model: User,
        }, {
          model: Tournament,
        }],
      });
      // TODO: C'est moche je pense avec sequelize on peut faire mieux
      let askingUsers = await User.findAll({
        where: { askingTeamId: req.params.id },
      });
      if (team) {
        const users = await Promise.all(team.users.map(
          async ({ username, firstname, lastname, email, id }) => {
            const isCartPaid = await Cart.count({
              where: {
                transactionState: 'paid',
              },
              include: [{
                model: CartItem,
                where: {
                  forUserId: id,
                  itemId: ticketId,
                },
              }],
            });
            return ({ username, firstname, lastname, email, id, isPaid: !!isCartPaid });
          },
        ));
        askingUsers = askingUsers.map(
          ({ username, firstname, lastname, email, id }) => (
            { username, firstname, lastname, email, id }
          ),
        );
        return res
          .status(200)
          .json({ ...team.toJSON(), users, askingUsers })
          .end();
      }
      return res
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
