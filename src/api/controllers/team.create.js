const { check } = require('express-validator/check')
const validateBody = require('../middlewares/validateBody')
const isAuth = require('../middlewares/isAuth')
const isNotInTeam = require('../middlewares/isNotInTeam')
const errorHandler = require('../utils/errorHandler')
const log = require('../utils/log')(module)

/**
 * POST /team
 * {
 *    name: String
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 */
module.exports = app => {
  app.post('/team', [isAuth('team-create'), isNotInTeam('team-create')])

  app.post('/team', [check('name').exists().matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i), validateBody()])

  app.post('/team', async (req, res) => {
    try {
      const team = await req.app.locals.models.Team.create({
        name: req.body.name,
        captainId: req.user.id
      })

      await req.user.setTeam(team)

      log.info(`user ${req.user.name} created team ${req.body.name}`)

      return res
        .status(200)
        .json({ team })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
