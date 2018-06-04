const { check } = require('express-validator/check')
const validateBody = require('../middlewares/validateBody')
const isAuth = require('../middlewares/isAuth')
const isInTeam = require('../middlewares/isInTeam')
const isCaptain = require('../middlewares/isCaptain')
const errorHandler = require('../utils/errorHandler')
const log = require('../utils/log')(module)

/**
 * POST /team/:id/accept
 * {
 *   user: String
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = app => {
  app.post('/team/:id/accept', [
    isAuth('team-accept'),
    isInTeam('team-accept'),
    isCaptain('team-accept')
  ])

  app.post('/team/:id/accept', [check('user').exists().isUUID(), validateBody()])

  app.post('/team/:id/accept', async (req, res) => {
    try {
      const user = await req.app.locals.models.User.findById(req.body.user)

      if (user.teamid) {
        log.warn(`user ${req.user.name} tried to accept ${user.name}, but he's in another team (${user.teamId})`)

        return res
          .status(401)
          .json({ error: 'ALREADY_IN_TEAM' })
          .end()
      }

      await req.app.locals.models.AskingUser.destroy({
        where: {
          userId: user.id
        }
      })

      await req.user.team.addUser(user)

      log.info(`user ${req.user.name} accepted user ${user.name}`)

      return res
        .status(200)
        .json({})
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
