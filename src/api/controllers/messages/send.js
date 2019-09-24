
const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const log = require('../../utils/log')(module);
const axios = require('axios');

const slack = axios.create({ baseURL: process.env.SLACK_URL });

const _ = require('lodash');

module.exports = (app) => {
  app.post('/messages', [isAuth()]);
  app.post('/messages', async (req, res) => {
    const {
      Message,
      User,
      Conversation,
      Permission,
      Team,
    } = req.app.locals.models;
    let conversation = null;
    try {
      const user = await User.findByPk(req.user.id, {
        include: [Permission],
      });
      const userTo = _.isUndefined(req.body.to)
        ? null
        : await User.findByPk(req.body.to);

      // Find if conversation exists
      if (!user.permission || (!user.permission.admin && !user.permission.respo)) {
        conversation = await Conversation.findOne({
          where: {
            user2: user.id,
          },
        });
      }
      else {
        conversation = await Conversation.findOne({
          where: {
            user2: userTo.id,
          },
        });
      }

      // If not, create one
      if (!conversation) {
        let team = '';
        if (user.permission && (user.permission.admin || user.permission.respo !== null)) {
          team = await Team.findByPk(userTo.teamId);
        }
        else {
          team = await Team.findByPk(user.teamId);
        }

        conversation = await Conversation.create({
          user1: null,
          user2: user.permission && (user.permission.admin || (user.permission.respo !== null)) ? userTo.id : user.id,
          spotlightId: team ? team.spotlightId : null,
        });
      }

      const message = await Message.create({
        message: req.body.message,
      });
      await message.setFrom(
        user.permission && (user.permission.admin || user.permission.respo) ? null : user,
      );
      userTo
        ? await message.setTo(
          userTo.permission && (userTo.permission.admin || userTo.permission.respo) ? null : userTo,
        )
        : await message.setTo(null);

      await message.setConversation(conversation.id);

      if (!_.isUndefined(req.body.spotlight) && userTo === null) {
        let channel = '';
        switch (req.body.spotlight) {
          case 1:
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_LOL;
            break;
          case 2:
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_LOL;
            break;
          case 3:
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_FORTNITE;
            break;
          case 4:
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_CS;
            break;
          case 5:
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_HS;
            break;
          case 6:
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_SSBU;
            break;
          case 'libre':
            channel = process.env.SLACK_CHANNEL_UA_TOURNOI_LIBRE;
            break;
          default:
            channel = process.env.SLACK_CHANNEL_UA_APP;
            break;
        }

        const slackNotif = `Nouveau message de ${user.name}\n\tAdmin : https://uttarena.app/dashboard/admin/messages/${user.id} \n\tRespo : https://uttarena.app/dashboard/respo/messages/${user.id}`;
        await slack.post(
          channel,
          { text: slackNotif },
          { headers: { 'Content-Type': 'application/json' } },
        );
      }

      return res
        .status(200)
        .json(message)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
