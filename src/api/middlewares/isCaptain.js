/**
 * @param {string} idName the name of the route parameter, which should be a string
 * if none is provided, it will be 'id'
 */
module.exports = idName => async (req, res, next) => {
    const { Team } = req.app.locals.models;
    const idString = idName !== undefined ? idName : 'id';
    const team = await Team.count({
        where: {
            captainId: req.user.id,
            id: req.params[idString],
        },
    });
    if (!team) {
        return res
            .status(401)
            .json({ error: 'NO_CAPTAIN' })
            .end();
    }
    req.team = team;
    return next();
};
