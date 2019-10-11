const log = require('../utils/log')(module);

module.exports = (route) => async (req, res, next) => {
  if (!req.user.team) {
    log.warn(`${route} failed : not in team`, { username: req.user.name });

    return res
      .status(401)
      .json({ error: 'NO_TEAM' })
      .end();
  }

  return next();
};
