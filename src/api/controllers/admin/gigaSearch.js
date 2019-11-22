const { Op } = require('sequelize');
const errorHandler = require('../../utils/errorHandler');
const querySearch = require('../../utils/querySearch');
const { includePay, includeCart } = require('../../utils/customIncludes');

/**
 * Get a user based on its id
 *
 * GET /admin/users/search
 * {
 *
 * }
 *
 * Response
 * {
 *   [User]
 * }
 *
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} tournamentModel
 */
const Search = (userModel, teamModel, tournamentModel, cartModel, cartItemModel, itemModel) => async (request, response) => {
  try {
    const { search } = request.query;

    const attributes = [
      'id',
      'email',
      'username',
      'firstname',
      'lastname',
      'place',
      'permissions',
      'type',
      'scanned'
    ];
    const usersFind = await userModel.findAndCountAll({
      where: querySearch(search),
      attributes,
      include: [
        {
          model: teamModel,
          attributes: ['name'],
          include: {
            model: tournamentModel,
            attributes: ['shortName'],
          },
        },
        includeCart(cartModel, cartItemModel, itemModel, userModel),
        includePay(cartItemModel, cartModel, userModel)
      ]
    });
    const usersTeam = await userModel.findAndCountAll({
      attributes,
      include: [
        {
          model: teamModel,
          attributes: ['name'],
          where: {
            name: {
              [Op.like]: `%${search}%`,
            }
          },
          include: {
            model: tournamentModel,
            attributes: ['shortName'],
          },
        },
        includeCart(cartModel, cartItemModel, itemModel, userModel),
        includePay(cartItemModel, cartModel, userModel)
      ]
    });

    let users = [...usersTeam.rows, ...usersFind.rows];

    // Remove duplicated users
    const uniqueUsers = {};
    users.forEach((user) => {
      uniqueUsers[user.email] = user;
    });
    users = Object.values(uniqueUsers);

    // Sort users
    users.sort((user1, user2) => user1.username > user2.username);

    const count = users.length;

    if (count === 0) {
      return response
        .status(404)
        .json({ error: 'USER_NOT_FOUND' })
        .end();
    }

    const formatUsers = users.map((user) => ({
      ...user.toJSON(),
      isPaid: user.forUser.length,
    }))

    return response
      .status(200)
      .json({
        users: formatUsers,
        limit: count,
        offset: 0,
        pageSize: count,
        total: count,
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = Search;
