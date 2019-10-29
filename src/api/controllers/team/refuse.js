const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

const CheckRefuseRequest = [check('userId').isUUID(), validateBody()];

/**
 * Refuse the join request to a team from a user.
 * This can also be used by a user to cancel his own request
 *
 * DELETE /teams/:id/request
 * {
 *    user: UUID
 * }
 *
 * Response:
 * {}
 *
 * @param {string} teamIdString the name of the team id
 * @param {object} userModel the user model to query
 */
const RefuseRequest = (teamIdString, userModel) => {
    return async (req, res) => {
        const teamId = req.params[teamIdString];

        try {
            if (
                req.user.askingTeamId === teamId &&
                req.body.userId === req.user.id
            ) {
                req.user.askingTeamId = null;
                await req.user.save();

                log.info(
                    `user ${req.user.username} cancel request to team ${teamId}`
                );

                return res.status(200).end();
            }

            if (req.user.id !== req.user.team.captainId) {
                return res.status(400).json({ error: 'NO_CAPTAIN' });
            }

            const user = await userModel.findOne({
                where: {
                    askingTeamId: teamId,
                    id: req.body.userId,
                },
            });
            user.askingTeamId = null;
            await user.save();
            return res.status(200).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { RefuseRequest, CheckRefuseRequest };
