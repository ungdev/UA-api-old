const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const axios = require('axios')
/**
 * GET /spotlights/:id/stages
 * {
 *
 * }
 * 
 * https://developer.toornament.com/v2/doc/viewer_stages
 * Response:
 * {
 *    stages: [Stages]
 * }
 */
module.exports = app => {
  app.get('/spotlights/:id/stages', [isAuth()])
  app.get('/spotlights/:id/stages', async (req, res) => {
    const { Spotlight } = req.app.locals.models

    try {
      const spotlight = await Spotlight.findById(req.params.id)
      const toornamentID = spotlight.toJSON().toornamentID
      const resp = await axios.get(`${toornamentID}/stages`,
      {  
        baseURL: env.TOORNAMENT_API,
        headers: {'X-Api-Key': env.TOORNAMENT_KEY}
      })
      const stages = resp.data.map(s => ({ ...s, toornamentID }))
      return res
        .status(200)
        .json(stages)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
