const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const { outputFields } = require('../../utils/publicFields');

/**
 * GET /spotlights/libre/players
 *
 * Response:
 *
 */
module.exports = (app) => {
  app.get('/spotlights/libre/players', [isAuth()]);

  app.get('/spotlights/libre/players', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      let users = await User.findAll({
        where: {
          paid: true,
          plusone: false,
          teamId: null,
        },
      });

      if (!users) {
        return res
          .status(404)
          .json('NO_USERS')
          .end();
      }

      users = users.map((user) => outputFields(user));

      return res
        .status(200)
        .json(users)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
