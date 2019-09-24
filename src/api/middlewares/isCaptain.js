const log = require('../utils/log')(module);

module.exports = (route) => (req, res, next) => {
  if (!req.user.team || req.user.team.captainId !== req.user.id) {
    log.warn(`${route} failed : not captain`);

    return res
      .status(401)
      .json({ error: 'NO_CAPTAIN' })
      .end();
  }

  return next();
};
