const debug = require('debug')('arena.utt.fr-api:spotlight-join')
const errorHandler = require('../utils/errorHandler')
const isAuth = require('../middlewares/isAuth')
const isInTeam = require('../middlewares/isInTeam')
const isCaptain = require('../middlewares/isCaptain')

/**
 * POST /spotlight/:id/leave
 * {
 *
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/spotlight/:id/leave', [
    isAuth('spotlight-leave'),
    isInTeam('spotlight-leave'),
    isCaptain('spotlight-leave')
  ])

  app.post('/spotlight/:id/leave', async (req, res) => {
    try {
      await req.user.team.update({
        spotlightId: null
      })

      if (req.user.team.soloTeam) {
        await req.user.team.destroy()
      }

      return res.status(200).json({ }).end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
