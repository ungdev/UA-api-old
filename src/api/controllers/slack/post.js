const axios = require('axios');
const bodyParser = require('body-parser');

const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');

const slack = axios.create({ baseURL: process.env.SLACK_URL });
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
  app.post('/slack', [isAuth()]);
  app.post('/slack', async (req, res) => {
    try {
      if (!req.body.message || !req.body.toChannel) {
        return res
          .status(400)
          .json({ error: 'missing params' })
          .end();
      }
      const channel = process.env.SLACK_CHANNEL_UA_GLOBAL;
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
        { headers: { 'Content-type': 'application/json' } },
      );
      return res
        .status(200)
        .json('OK')
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });

  app.post('/publicSlack', async (req, res) => {
    try {
      if (
        !req.body.user
        || !req.body.user.lastname
        || !req.body.user.firstname
        || !req.body.user.topic
        || !req.body.user.phone
        || !req.body.user.email
        || !req.body.user.message
      ) {
        return res
          .status(400)
          .json({ error: 'INVALID_FORM' })
          .end();
      }
      const { user } = req.body;
      user.topic = user.topic.label;
      const text = `Message depuis le formulaire de contact du site :\n
          De: ${user.firstname} ${user.lastname}\n
          Mail: ${user.email}\n
          Téléphone: ${user.phone}\n
          Sujet: ${user.topic}\n
          Message: ${user.message}`;
      await slack.post(
        env.SLACK_CHANNEL_UA_APP,
        { text },
        { headers: { 'Content-type': 'application/json' } },
      );
      return res
        .status(200)
        .json('OK')
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  app.post('/slack/update', async (req, res) => res.status(200).json({ challenge: req.body.challenge }));
};
