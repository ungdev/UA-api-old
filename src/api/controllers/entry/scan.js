const errorHandler = require('../../utils/errorHandler');
const hasCartPaid = require('../../utils/hasCartPaid');

/**
 * Scan a user based on its barcode
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
    const user = await userModel.findOne({
      where: {
        barcode: request.query.barcode,
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

    if (!user) {
      return response
        .status(404)
        .json({ error: 'USER_NOT_FOUND' })
        .end();
    }

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
        .json({ error: 'USER_NOT_PAID' })
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
