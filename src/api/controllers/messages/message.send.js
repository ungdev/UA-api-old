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
    const { Message, User, Conversation, Permission } = req.app.locals.models
    let conversation
    try {
      const user = await User.findById(req.user.id, {
        include: [Permission]
      })
      const userTo = _.isUndefined(req.body.to)
        ? null
        : await User.findById(req.body.to)

      if (!user.permission || !user.permission.admin) {
        conversation = await Conversation.findOne({
          where: {
            user2: user.id
          }
        })

        //If no conv opened yet, create one.
        if (!conversation)
          await Conversation.create({
            user1: null,
            user2: user.permission && user.permission.admin ? userTo.id : user.id
          })
        conversation = await Conversation.findOne({
          where: {
            user2: user.id
          }
        })
      }

      const message = await Message.create({
        message: req.body.message
      })
      await message.setFrom(user.permission && user.permission.admin ? null : user)
      userTo
        ? await message.setTo(userTo.permission && userTo.permission.admin === 1 ? null : userTo)
        : await message.setTo(null)

      await message.setConversation(conversation)

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
