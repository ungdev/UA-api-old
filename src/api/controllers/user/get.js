const errorHandler = require('../../utils/errorHandler');
const hasCartPaid = require('../../utils/hasCartPaid');

/**
 * Get a user based on its id
 *
 * GET /users/:id
 * {
 *
 * }
 *
 * Response
 * {
 *   User
 * }
 *
 * @param {string} userIdString the name of the user id in the route parameter
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Get = (userIdString, userModel, teamModel, cartModel, cartItemModel) => async (req, res) => {
  try {
    const userId = req.params[userIdString];
    const user = await userModel.findByPk(userId, {
      attributes: [
        'id',
        'username',
        'firstname',
        'lastname',
        'email',
        'askingTeamId',
        'type',
        'permissions',
      ],
      include: {
        model: teamModel,
        attributes: ['id', 'name'],
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }
    const isPaid = await hasCartPaid(user, cartModel, cartItemModel);

    return res
      .status(200)
      .json({ ...user.toJSON(), isPaid })
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = Get;
