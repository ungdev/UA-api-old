const { check } = require('express-validator/check')
const validateBody = require('../middlewares/validateBody')
const isAuth = require('../middlewares/isAuth')
const isNotInTeam = require('../middlewares/isNotInTeam')
const errorHandler = require('../utils/errorHandler')
const { outputFields } = require('../utils/publicFields')
const log = require('../utils/log')(module)

/**
 * POST /team/:id/join
 * {
 *    message: String
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 */
module.exports = app => {
  app.post('/team/:id/join', [isAuth('team-join'), isNotInTeam('team-join')])

  app.post('/team/:id/join', [check('message').optional(), validateBody()])

  app.post('/team/:id/join', async (req, res) => {
    if (req.user.teamId !== null) {
      log.warn(`user ${req.user.name} tried to join team while he already has one`)

      return res
        .status(400)
        .json({ error: 'ALREADY_IN_TEAM' })
        .end()
    }

    try {
      const team = await req.app.locals.models.Team.findById(req.params.id, {
        include: [User, Spotlight]
      })

      await team.addAskingUser(req.user, { through: { message: req.body.joinTeamFinderMessage } })

      team.users = team.users.map(outputFields)

      log.info(`user ${req.user.name} asked to join team ${team.name}`)

      return res
        .status(200)
        .json({ team })
        .end()
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res
          .status(400)
          .json({ error: 'DUPLICATE_ENTRY' })
          .end()
      }

      log.error('failed to join team', err)

      return res
        .status(500)
        .json({ error: 'UNKNOWN' })
        .end()
    }
  })
}
