const { Op } = require('sequelize');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /users
 * Query Params: {
 *    exact: bool. Should the email or the username exactly match in the DB ?
 *    or: bool. Should we search for matching email OR username ? Default operator is AND.
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

    const exact = typeof req.query.exact !== 'undefined';
    const or = typeof req.query.or !== 'undefined';

    // Compute 'where' parameters
    const reqWhere = [];
    if (req.query.email) {
      reqWhere.push({
        email: exact
          ? req.query.email
          : { [Op.like]: `%${req.query.email || ''}%` },
      });
    }
    if (req.query.username) {
      reqWhere.push({
        username: exact
          ? req.query.username
          : { [Op.like]: `%${req.query.username || ''}%` },
      });
    }

    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'firstname', 'lastname'],
        where: Object.values(reqWhere).length > 0
          ? {
            [or ? Op.or : Op.and]: reqWhere,
          }
          : {},
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