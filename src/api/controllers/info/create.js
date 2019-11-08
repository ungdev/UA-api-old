const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');

const CheckCreate = [
  check('title').isString(),
  check('content').isString(),
  check('tournamentId').optional(),
  validateBody(),
];

/**
 * POST /infos
 * {
 *    title: String
 *    content: String
 *    tournamentId: Int
 * }
 * Response
 * {
 *   Info
 * }
 * @param {object} infoModel model to query Infos
 */
const Create = (infoModel) => async (request, response) => {
  try {
    const info = await infoModel.create({
      ...request.body,
      userId: request.user.id,
    });

    return response
      .status(201)
      .json({
        ...info.toJSON(),
        user: { firstname: request.user.firstname, lastname: request.user.lastname },
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = { Create, CheckCreate };
