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
  app.get('/spotlights/:id', [isAuth()])
  app.get('/spotlights/:id', async (req, res) => {
    const { Spotlight, Team, User } = req.app.locals.models

    try {
      let spotlight = await Spotlight.findById(req.params.id)
      return res
        .status(200)
        .json(spotlight)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
