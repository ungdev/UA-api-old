const { check } = require('express-validator');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

const CheckEdit = [
    check('captainId')
        .exists()
        .isUUID(),
    validateBody(),
];

/**
 * Change the team captain
 *
 * PUT /teams/:id
 *
 * {
 *   captainId: UUID
 * }
 *
 * Response:
 *  {}
 * @param {string} teamIdString name of the team id
 * @param {object} teamModel team model to query
 */
const Edit = (teamIdString, teamModel) => {
    return async (req, res) => {
        const teamId = req.params[teamIdString];
        try {
            const team = await teamModel.findOne({
                where: {
                    captainId: req.user.id,
                    id: teamId,
                },
            });
            if (!team) {
                return res
                    .status(404)
                    .json({ error: 'TEAM_NOT_FOUND' })
                    .end();
            }
            await team.setCaptain(req.body.captainId);
            return res.status(204).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { Edit, CheckEdit };
