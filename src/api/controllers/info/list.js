const errorHandler = require('../../utils/errorHandler');

/**
 * GET /infos
 * {
 *
 * }
 * Response
 * {
 *   Infos
 * }
 * @param {object} infoModel model to query Infos
 */
const List = (infoModel, userModel) => async (request, response) => {
  try {
    const infos = await infoModel.findAll({
      include: [{
        model: userModel,
        attributes: ['firstname', 'lastname'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return response
      .status(200)
      .json(infos)
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = List;
