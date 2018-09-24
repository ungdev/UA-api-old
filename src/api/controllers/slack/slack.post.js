const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const axios = require('axios')

const slack = axios.create({ baseURL: env.SLACK_URL })
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
  app.post('/slack', [isAuth()])
  app.post('/slack', async (req, res) => {

    try {
      if(!req.body.message || !req.body.toChannel)
        return res
        .status(400)
        .json({error: 'missing params'})
        .end()
      let channel = ''
      switch(req.body.toChannel) {
        case '1':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_LOL
          break
        case '2':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_HS
          break
        case '3':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_FORTNITE
          break
        case '4':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_SSBU
          break
        case '5':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_CS
          break
        case '6':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_LOL
          break
        case '7':
          channel = env.SLACK_CHANNEL_UA_TOURNOI_LIBRE
          break
        default:
          channel = env.SLACK_CHANNEL_UA_APP
          break
      }
      slack.post(channel, { text: req.body.message }, { headers: { 'Content-type': 'application/json' } })
      return res
        .status(200)
        .json('OK')
        .end()
      
    } catch (err) {
      errorHandler(err, res)
    }
  })
}

