const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * Deletes a user from a team.
 *
 * @param {string} teamIdString name of the route parameter for teamId (*ex:* `/:<teamId>/`)
 * @param {string} userIdString name of the route parameter for userId (*ex:* `/:<userId>/`)
 * @param {object} userModel the user model to execute query
 * @param {object} teamModel the team model to execute query
 *
 * DELETE /teams/:id/users/:userId
 * {
 *
 * }
 *
 * Response:
 * {
 *
 * }
 */
const DeleteUserFromTeam = (
    teamIdString,
    userIdString,
    userModel,
    teamModel
) => {
    return async (req, res) => {
        const userId = req.params[userIdString];
        const teamId = req.params[teamIdString];

        // is captain or self-kick (= leave), else deny
        if (req.user.team.captainId !== req.user.id && req.user.id !== userId) {
            log.warn(
                `user ${req.user.name} tried to kick without being captain`
            );

            return res
                .status(403)
                .json({ error: 'NO_CAPTAIN' })
                .end();
        }

        try {
            const user = await userModel.findOne({
                where: {
                    id: userId,
                    teamId: teamId,
                },
                include: [teamModel],
            });

            if (!user) {
                log.warn(
                    `user ${req.user.username} tried to kick someone but he was not in the team`
                );

                return res
                    .status(404)
                    .json({ error: 'NOT_FOUND' })
                    .end();
            }

            if (user.team.captainId === userId) {
                log.info("Can't delete captain user");
                return res
                    .status(403)
                    .json({ error: 'CAPTAIN' })
                    .end();
            }
            if (user.team.captainId === req.user.id || userId === req.user.id) {
                user.teamId = null;
                user.type = 'none';
                await user.save();
                return res.status(200).end();
            }
            return res.status(401).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = DeleteUserFromTeam;
