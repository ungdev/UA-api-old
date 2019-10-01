const { Op } = require('sequelize');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /users
 * Query Params: {
 *    username: String. Fait une requete LIKE en SQL
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

    try {
      const users = await User.findAll({
        attributes: ['username', 'firstname', 'lastname'],
        where: {
          username: {
            [Op.like]: req.query.username ? `%${req.query.username}%` : '%%',
          },
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