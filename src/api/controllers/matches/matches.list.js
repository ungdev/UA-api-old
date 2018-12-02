const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const axios = require('axios')
const getAccessToken = require('../../utils/getAccessToken')
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
    // const { Team } = req.app.locals.models
      if ((req.session.expiresIn && req.session.expiresIn < Date.now()) || !req.session.accessToken) {
        await getAccessToken(req.session);
      }
    try {
      const resp = await axios.get(`${req.query.spotlightID}/matches`, {  
        baseURL: "https://api.toornament.com/organizer/v2/tournaments",
        headers: {
          'X-Api-Key': env.TOORNAMENT_KEY,
          Authorization: `Bearer ${req.session.accessToken}`,
          Range: "matches=0-64"},
        params: { participant_ids: req.params.id } })
      return res
        .status(200)
        .json(resp.data)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
