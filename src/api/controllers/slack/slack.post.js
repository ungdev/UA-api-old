const env = require("../../../env")
const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const axios = require("axios")
const log = require("../../utils/log")(module)
const slack = axios.create({ baseURL: env.SLACK_URL })
const bodyParser = require('body-parser')
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
  app.post("/slack", [isAuth()])
  app.post("/slack", async (req, res) => {
    try {
      if (!req.body.message || !req.body.toChannel)
        return res
          .status(400)
          .json({ error: "missing params" })
          .end()
      let channel = env.SLACK_CHANNEL_UA_GLOBAL
      // switch (req.body.toChannel) {
      //   case "1":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_LOL
      //     break
      //   case "2":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_LOL
      //     break
      //   case "3":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_FORTNITE
      //     break
      //   case "4":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_CS
      //     break
      //   case "5":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_HS
      //     break
      //   case "6":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_SSBU
      //     break
      //   case "libre":
      //     channel = env.SLACK_CHANNEL_UA_TOURNOI_LIBRE
      //     break
      //   default:
      //     channel = env.SLACK_CHANNEL_UA_APP
      //     break
      // } 
      slack.post(
        channel,
        { text: req.body.message },
        { headers: { "Content-type": "application/json" } }
      )
      return res
        .status(200)
        .json("OK")
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })

  app.post("/publicSlack", async (req, res) => {
    try {
      if (
        !req.body.user ||
        !req.body.user.lastname ||
        !req.body.user.firstname ||
        !req.body.user.topic ||
        !req.body.user.phone ||
        !req.body.user.email ||
        !req.body.user.message
      )
        return res
          .status(400)
          .json({ error: "INVALID_FORM" })
          .end()
      let { user } = req.body
      user.topic = user.topic.label
      let text = `Message depuis le formulaire de contact du site :\n
          De: ${user.firstname} ${user.lastname}\n
          Mail: ${user.email}\n
          Téléphone: ${user.phone}\n
          Sujet: ${user.topic}\n
          Message: ${user.message}`
      await slack.post(
        env.SLACK_CHANNEL_UA_APP,
        { text },
        { headers: { "Content-type": "application/json" } }
      )
      return res
        .status(200)
        .json("OK")
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))
  app.post("/slack/update", async (req, res) => {
    return res.status(200).json({ challenge: req.body.challenge })
  })
}
