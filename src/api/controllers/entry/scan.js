const errorHandler = require('../../utils/errorHandler');
const hasCartPaid = require('../../utils/hasCartPaid');
const querySearch = require('../../utils/querySearch');

/**
 * Get a user based on its id
 *
 * POST /entry/scan
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
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Scan = (userModel, teamModel, tournamentModel, cartModel, cartItemModel) => async (request, response) => {
  try {
    const { barcode, search } = request.query;
    const users = await userModel.findAll({
      where: barcode
        ? { barcode }
        : {
          ...querySearch(search),
        },
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

    if (user.scanned) {
      return response
        .status(403)
        .json({ error: 'ALREADY_SCANNED' })
        .end();
    }
    const isPaid = await hasCartPaid(user, cartModel, cartItemModel);

    if (!isPaid) {
      return response
        .status(403)
        .json({ error: 'NOT_PAID' })
        .end();
    }

    await user.update({ scanned: true });

    return response
      .status(200)
      .json(user)
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = Scan;
