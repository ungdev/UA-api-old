const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const axios = require('axios')
/**
 * GET /matches/:id
 * {
 *    spotlightID: Spotlight.toornamentID
 * }
 * 
 * https://developer.toornament.com/v2/doc/viewer_matches
 * Response:
 * {
 *    matches: [Matches]
 * }
 */
module.exports = app => {
  app.get('/matches/:id', [isAuth()])
  app.get('/matches/:id', async (req, res) => {
    try {
      const resp = await axios.get(`${req.query.spotlightID}/matches`,
      {  
        baseURL: env.TOORNAMENT_API,
        headers: {'X-Api-Key': env.TOORNAMENT_KEY, Range: "matches=0-127"},
        params: { participant_ids: req.params.id },
      })
      return res
        .status(200)
        .json(resp.data)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
