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
 * @param {(title: string, content: string, tournamentId: int) => void} sendNotificationToTournament callback to send notification to  tournament users users
 */
const Create = (infoModel, sendNotificationToTournament) => async (
  request,
  response
) => {
  try {
    const info = await infoModel.create({
      ...request.body,
      userId: request.user.id,
    });

    sendNotificationToTournament(
      request.body.title,
      request.body.content,
      request.body.tournamentId
    );

    return response
      .status(201)
      .json({
        ...info.toJSON(),
        user: {
          firstname: request.user.firstname,
          lastname: request.user.lastname,
        },
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = { Create, CheckCreate };
