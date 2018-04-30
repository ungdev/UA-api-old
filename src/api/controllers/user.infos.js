const pick = require('lodash.pick')
const jwt = require('jsonwebtoken')
const isAuth = require('../middlewares/isAuth')
const env = require('../../env')
const errorHandler = require('../utils/errorHandler')
const { outputFields } = require('../utils/publicFields')
const { isSpotlightFull } = require('../utils/isFull')

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
  app.get('/user', [isAuth()])

  app.get('/user', async (req, res) => {
    const { User, Spotlight, Team, AskingUser } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findAll({
        include: [
          {
            model: Team,
            include: [User]
          }
        ]
      })

      let teams = await Team.findAll({
        include: [{ model: User, through: AskingUser, as: 'AskingUser' }]
      })

      // clean teams
      teams = teams.map(team => {
        team = team.toJSON()

        // AskingUser = users on AskingUsers
        if (team.AskingUser) {
          team.askingUsers = team.AskingUser.map(teamUser => {
            // clean the user
            const cleanedUser = outputFields(teamUser)

            // add data from join table
            cleanedUser.askingMessage = teamUser.askingUser.message

            return cleanedUser
          })

          delete team.AskingUser
        }

        return team
      })

      spotlights = spotlights.map(spotlight => {
        spotlight = spotlight.toJSON()

        spotlight.isFull = isSpotlightFull(spotlight, true)
      })

      // Generate new token
      const token = jwt.sign({ id: req.user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      const user = req.user.toJSON()

      // clean user team
      if (user.team && user.team.users.length > 0) {
        user.team.users = user.team.users.map(outputFields)
      }

      return res
        .status(200)
        .json({
          user: outputFields(user),
          token,
          spotlights: spotlights,
          teams,
          prices: {
            partners: env.ARENA_PRICES_PARTNER_MAILS,
            plusone: env.ARENA_PRICES_PLUSONE,
            partner: env.ARENA_PRICES_PARTNER,
            default: env.ARENA_PRICES_DEFAULT,
            ethernet: env.ARENA_PRICES_ETHERNET,
            shirt: env.ARENA_PRICES_SHIRT
          }
        })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
