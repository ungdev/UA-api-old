const debug = require('debug')('arena.utt.fr-api:isInTeam')

module.exports = (route) => async function (req, res, next) {
  if (!req.user.team) {
    debug(`${route} failed : not in team`)

    return res.status(401).json({ error: 'NO_TEAM' }).end()
  }

  next()
}
