const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /spotlights/:id
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
    const { Spotlight, Team } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findById(req.params.id, {
        include: [
          {
            model: Team
          }
        ]
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