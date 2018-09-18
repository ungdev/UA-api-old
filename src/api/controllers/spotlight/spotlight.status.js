const pick = require('lodash.pick')
const env = require('../../../env')
const { isSpotlightFull } = require('../../utils/isFull')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /spotlights
 * {
 *
 * }
 *
 * Response:
 * {
 *    spotlights: [Spotlight]
 * }
 */
module.exports = app => {
  app.get('/spotlights', [isAuth()])
  app.get('/spotlights', async (req, res) => {
    const { Spotlight, Team, User } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findAll({
        include: [
          {
            model: Team,
            include: [User]
          }
        ]
      })

      spotlights = spotlights.map(spotlight => {
        spotlight = spotlight.toJSON()

        spotlight.isFull = isSpotlightFull(spotlight, true)

        return pick(spotlight, ['id', 'name', 'isFull'])
      })

      return res
        .status(200)
        .json(spotlights)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
