/**
 * Check if the user who make the request is part of the specified team
 * @param {string?} idStringName the name of the id to check in the params. If undefined, it will be "id"
 */
module.exports = idStringName => async (req, res, next) => {
    const id = idStringName === undefined ? 'id' : idStringName;
    if (req.user.team.id !== req.params[id]) {
        return res
            .status(403)
            .json({ error: 'UNAUTHORIZED' })
            .end();
    }

    return next();
};
