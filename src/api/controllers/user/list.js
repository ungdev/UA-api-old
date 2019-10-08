const { Op } = require('sequelize');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /users
 * Query Params: {
 *    exact: bool. Should the email or the username exactly match in the DB ?
 *    email: String
 *    username: String
 * }
 *
 * Response
 * {
 *   [User]
 * }
 */
module.exports = (app) => {
  app.get('/users', [isAuth()]);

  app.get('/users', async (req, res) => {
    const { User, Team, Tournament } = req.app.locals.models;

    // Compute 'where' parameter
    const reqWhere = {};
    if (req.query.email) {
      reqWhere.email = typeof req.query.exact !== 'undefined'
        ? req.query.email
        : { [Op.like]: req.query.email ? `%${req.query.email}%` : '%%' };
    }
    if (req.query.username) {
      reqWhere.username = typeof req.query.exact !== 'undefined'
        ? req.query.username
        : { [Op.like]: req.query.username ? `%${req.query.username}%` : '%%' };
    }

    try {
      const users = await User.findAll({
        attributes: ['username', 'firstname', 'lastname'],
        where: Object.values(reqWhere).length > 0 ? { [Op.or]: [reqWhere] } : {},
        include: {
          model: Team,
          attributes: ['name'],
          include: {
            model: Tournament,
            attributes: ['name', 'shortName'],
          },
        },
      });

      return res
        .status(200)
        .json(users)
        .end();
    }

    catch (error) {
      return errorHandler(error, res);
    }
  });
};