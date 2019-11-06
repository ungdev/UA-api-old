const log = require('../utils/log')(module);

module.exports = (route) => async (req, res, next) => {
  if (req.user.team) {
    log.debug(`${route} failed : already in team`);

    return res
      .status(401)
      .json({ error: 'ALREADY_IN_TEAM' })
      .end();
  }

  return next();
};
