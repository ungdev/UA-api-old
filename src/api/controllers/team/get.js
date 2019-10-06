const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /teams/:id
 *
 * Response:
 *  Team
 */
module.exports = (app) => {
  app.get('/teams/:id', [isAuth()]);

  app.get('/teams/:id', async (req, res) => {
    const { Team, User, Tournament } = req.app.locals.models;

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
        const users = team.users.map(
          ({ username, firstname, lastname, email, id }) => (
            { username, firstname, lastname, email, id }
          ),
        );
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
