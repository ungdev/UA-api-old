const debug = require('debug')('arena.utt.fr-api:isCaptain')

module.exports = (route) => (req, res, next) => {
  if (!req.user.team || req.user.team.captainId !== req.user.id) {
    debug(`${route} failed : not captain`)

    return res.status(401).json({ error: 'NO_CAPTAIN' }).end()
  }

  next()
}
