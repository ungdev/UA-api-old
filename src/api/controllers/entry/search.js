const errorHandler = require('../../utils/errorHandler');
const querySearch = require('../../utils/querySearch');

/**
 * Get a user based on its id
 *
 * GET /entry/user
 * {
 *
 * }
 *
 * Response
 * {
 *   User
 * }
 *
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} tournamentModel
 */
const Search = (userModel, teamModel, tournamentModel) => async (request, response) => {
  try {
    const { search } = request.query;
    const users = await userModel.findAll({
      where: querySearch(search),
      include: {
        model: teamModel,
        attributes: ['id', 'name'],
        include: {
          model: tournamentModel,
          attributes: ['shortName'],
        },
      },
    });

    if (users.length > 1) {
      return response
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }

    const user = users[0];

    return response
      .status(200)
      .json(user)
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = Search;
