const pick = require('lodash.pick')
const jwt = require('jsonwebtoken')
const isAuth = require('../../middlewares/isAuth')
const env = require('../../../env')
const log = require('../../utils/log')(module)
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const { isSpotlightFull } = require('../../utils/isFull')

/**
 * GET /user
 *
 * Response:
 * {
 *    user: User
 *    token: String,
 *    spotlights: [Spotlight]
 *    teams: [Team]
 *    teamfinders: [Teamfinder],
 *    prices: Object
 * }
 */
module.exports = app => {
  app.get('/spotlights/:id/teams', [isAuth()])

  app.get('/spotlights/:id/teams', async (req, res) => {
    const { Spotlight, Team } = req.app.locals.models

    try {
      const spotlight = await Spotlight.findById(req.params.id, {
        include: [
          {
            model: Team
          }
        ]
      })
      return res
        .status(200)
        .json({
          spotlight: {
            id: spotlight.id,
            name: spotlight.name,
            teams: spotlight.teams,
          }
        })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
