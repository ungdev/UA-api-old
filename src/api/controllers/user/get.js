const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
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
    const { User, Team } = req.app.locals.models;

    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'firstname', 'lastname', 'email', 'askingTeamId'],
        include: {
          model: Team,
          attributes: ['id', 'name'],
        },
      });

      if (!user) return res.status(404).json({ error: 'NOT_FOUND' }).end();
      if (req.params.id !== user.id) {
        return res.status(403)
          .json({ error: 'UNAUTHORIZED' })
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