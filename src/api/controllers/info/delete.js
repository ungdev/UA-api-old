const errorHandler = require('../../utils/errorHandler');

/**
 * DELETE /infos/:id
 * {
 *
 * }
 * Response
 * {
 *
 * }
 * @param {string} infoIdString
 * @param {object} infoModel model to query Infos
 */
const Delete = (infoIdString, infoModel) => async (request, response) => {
  try {
    const id = request.params[infoIdString];
    await infoModel.destroy({
      where: { id },
    });

    return response
      .status(204)
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = Delete;
