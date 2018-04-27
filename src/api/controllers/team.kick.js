const isAuth = require('../middlewares/isAuth')
const isInTeam = require('../middlewares/isInTeam')
const errorHandler = require('../utils/errorHandler')
const log = require('../utils/log')(module)

/**
 * POST /team/:id/kick/:userId
 * {
 *
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = app => {
  app.post('/team/:id/kick', [isAuth('team-kick'), isInTeam('team-kick')])

  app.post('/team/:id/kick', async (req, res) => {
    // is captain or self-kick (= leave), else deny
    if (req.user.team.captainId !== req.user.id && req.user.id !== req.params.userId) {
      log.warn(`user ${req.user.name} tried to kick without being captain`)

      return res
        .status(401)
        .json({ error: 'NO_CAPTAIN' })
        .end()
    }

    try {
      const user = await User.findOne({
        where: {
          id: req.params.userId,
          teamId: req.user.team.id
        }
      })

      await req.user.team.removeUser(req.body.user)

      log.info(`user ${req.user.name} kicked ${user.name}`)

      return res
        .status(200)
        .json({})
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
