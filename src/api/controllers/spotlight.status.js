const debug = require('debug')('arena.utt.fr-api:spotlight-status')
const errorHandler = require('../utils/errorHandler')
const pick = require('lodash.pick')
const { isSpotlightFull } = require('../utils/isFull')
const env = require('../../env')

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
module.exports = (app) => {
  app.get('/spotlights', async (req, res) => {
    const { Spotlight } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findAll({
          include: [
            {
              model: Team,
              include: [ User ]
            }
          ]
      })

      spotlights = spotlights.map((spotlight) => {
        spotlight = spotlight.toJSON()

        spotlight.isFull = isSpotlightFull(spotlight, true)

        return pick(spotlight, ['id', 'name', 'isFull'])
      })

      return res.status(200).json(spotlights).end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
