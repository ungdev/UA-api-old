const debug = require('debug')('arena.utt.fr-api:isNotInTeam');

module.exports = (route) => async function (req, res, next) {
  if (req.user.team) {
    debug(`${route} failed : already in team`);

    return res
      .status(401)
      .json({ error: 'ALREADY_IN_TEAM' })
      .end();
  }

  return next();
};
