const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const Sequelize = require('sequelize')
const log = require('../../utils/log')(module)
const axios = require('axios')
const slack = axios.create({ baseURL: env.SLACK_URL })

const _ = require('lodash')

module.exports = app => {
  app.post('/messages', [isAuth()])
  app.post('/messages', async (req, res) => {
    const {
      Message,
      User,
      Conversation,
      Permission,
      Team
    } = req.app.locals.models
    let conversation
    try {
      const user = await User.findById(req.user.id, {
        include: [Permission]
      })
      const userTo = _.isUndefined(req.body.to)
        ? null
        : await User.findById(req.body.to)

      // Find if conversation exists
      if (!user.permission || !user.permission.admin) {
        conversation = await Conversation.findOne({
          where: {
            user2: user.id
          }
        })
      } else {
        conversation = await Conversation.findOne({
          where: {
            user2: userTo.id
          }
        })
      }

      // If not, create one
      if (!conversation){
        let team = ''
        if(user.permission && (user.permission.admin || (user.permission.respo !== null) )){
          team = await Team.findById(userTo.teamId)
        }
        else{
          team = await Team.findById(user.teamId)
        }
        log.info(team.spotlightId)
        await Conversation.create({
          user1: null,
          user2: user.permission && (user.permission.admin || (user.permission.respo !== null) ) ? userTo.id : user.id,
          spotlightId: team.spotlightId
        })
      }

      // Then get conversation id to set the conversationId attributes of the message
      if (!user.permission || !user.permission.admin) {
        conversation = await Conversation.findOne({
          where: {
            user2: user.id
          }
        })
      } else {
        conversation = await Conversation.findOne({
          where: {
            user2: userTo.id
          }
        })
      }

      const message = await Message.create({
        message: req.body.message
      })
      await message.setFrom(
        user.permission && user.permission.admin ? null : user
      )
      userTo
        ? await message.setTo(
            userTo.permission && userTo.permission.admin === 1 ? null : userTo
          )
        : await message.setTo(null)

      await message.setConversation(conversation.id)

      let slackNotif
      if (!_.isUndefined(req.body.spotlight)) {
        let channel = ''
        switch (req.body.spotlight) {
          case 1:
            channel = env.SLACK_CHANNEL_UA_TOURNOI_LOL
            break
          case 2:
            channel = env.SLACK_CHANNEL_UA_TOURNOI_LOL
            break
          case 3:
            channel = env.SLACK_CHANNEL_UA_TOURNOI_FORTNITE
            break
          case 4:
            channel = env.SLACK_CHANNEL_UA_TOURNOI_CS
            break
          case 5:
            channel = env.SLACK_CHANNEL_UA_TOURNOI_HS
            break
          case 6:
            channel = env.SLACK_CHANNEL_UA_TOURNOI_SSBU
            break
          case 'libre':
            channel = env.SLACK_CHANNEL_UA_TOURNOI_LIBRE
            break
          default:
            channel = env.SLACK_CHANNEL_UA_APP
            break
        }
        if (userTo === null) {
          slackNotif = `Nouveau message de ${
            user.name
          } -> https://uttarena.app/dashboard/admin/messages/${user.id}`
          await slack.post(
            channel,
            { text: slackNotif },
            { headers: { 'Content-Type': 'application/json' } }
          )
        }
      }

      return res
        .status(200)
        .json(message)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
