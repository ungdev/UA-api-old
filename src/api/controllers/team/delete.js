const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const isCaptain = require('../../middlewares/isCaptain');
const isType = require('../../middlewares/isType');

/**
 * Delete a team
 *
 * DELETE /teams/:id
 *
 * Response:
 * @param {string} teamIdString the name of the id to look for in the route parameter
 */
const Delete = teamIdString => {
    return async (req, res) => {
        const teamId = req.params[teamIdString];
        try {
            req.user.type = 'none';
            await req.user.save();
            await req.user.team.destroy();
            return res.status(204).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = Delete;
