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
  app.get('/teams', [isAuth()])

  app.get('/teams', async (req, res) => {
    const { Team, User } = req.app.locals.models

    try {
      let teams = await Team.findAll({
        include: [
          {
            model: User
          }
        ]
      })
      teams = teams.map(team => {
        return {
          id : team.id,
          name: team.name,
          captainId: team.captainId,
          soloTeam: team.soloTeam,
          spotlightId: team.spotlightId,
          users: team.users.map(user => {
            return {
              id: user.id,
              name: user.name,
              role: user.role,
          }})
      }})
      return res
        .status(200)
        .json(teams)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
