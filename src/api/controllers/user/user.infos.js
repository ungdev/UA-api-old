const log = require('../../utils/log')(module)
const jwt = require('jsonwebtoken')
const isAuth = require('../../middlewares/isAuth')
const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const { isSpotlightFull } = require('../../utils/isFull')
const isInSpotlight = require('../../utils/isInSpotlight')

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
    const { User, Permission, Spotlight, Team, Order } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findAll({
        include: [{
          model: Team,
          include: [User]
        }]
      })

      // Generate new token
      const token = jwt.sign({ id: req.user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      const user = req.user.toJSON()

      // Clean user team
      if (user.team && user.team.users.length > 0) {
        user.team.users = user.team.users.map(outputFields)
        user.team.isInSpotlight = await isInSpotlight(user.team.id, req)
      }

      spotlights = spotlights.map(spotlight => {
        spotlight = spotlight.toJSON()

        spotlight.isFull = isSpotlightFull(spotlight)

        return spotlight
      })

      // Get permission
      const permission = await Permission.findOne({
        where: { userId: user.id }
      })

      let permissionData = null

      if(permission) {
        permissionData = {
          admin: permission.admin,
          respo: permission.respo,
          permission: permission.permission
        }
      }
      else {
        log.info(`No permission found for user ${user.name}`)
      }

      // Select returned information about user
      let userData = {
        ...outputFields(user),
        permission: permissionData,
        orders: await Order.findAll({
          where: { userId: user.id }
        }),
        team: user.team,
        place: (user.tableLetter + user.placeNumber) || ''
      }

      return res
        .status(200)
        .json({
          user: userData,
          token,
          spotlights,
          prices: {
            partners: env.ARENA_PRICES_PARTNER_MAILS,
            plusone: env.ARENA_PRICES_PLUSONE,
            partner: env.ARENA_PRICES_PARTNER,
            default: env.ARENA_PRICES_DEFAULT,
            ethernet: env.ARENA_PRICES_ETHERNET,
            ethernet7: env.ARENA_PRICES_ETHERNET7,
            shirt: env.ARENA_PRICES_SHIRT,
            laptop: env.ARENA_PRICES_LAPTOP,
            screen27: env.ARENA_PRICES_SCREEN27,
            kaliento: env.ARENA_PRICES_KALIENTO,
            mouse: env.ARENA_PRICES_MOUSE,
            headset: env.ARENA_PRICES_HEADSET,
            keyboard: env.ARENA_PRICES_KEYBOARD,
            chair: env.ARENA_PRICES_CHAIR,
            streamingPC: env.ARENA_PRICES_STREAMING_PC,
            gamingPC: env.ARENA_PRICES_GAMING_PC,
            screen24: env.ARENA_PRICES_SCREEN24,
            tombola: env.ARENA_PRICES_TOMBOLA,
          }
        })
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
