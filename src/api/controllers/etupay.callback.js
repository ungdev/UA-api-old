const env = require('../../env')
const log = require('../utils/log')(module)
const moment = require('moment')
const sendPdf = require('../utils/sendPDF')
const etupay = require('@ung/node-etupay')({
  id: env.ARENA_ETUPAY_ID,
  url: env.ARENA_ETUPAY_URL,
  key: env.ARENA_ETUPAY_KEY
})
async function leaveTeam(user, Team, User) {
  let team = await Team.findById(user.teamId)
  if (team){
    if (team.captainId === user.id) {
      log.info(`user ${user.name} left ${team.name} and destroyed it, as captain`)
      let users = await User.findAll({ where: { teamId: team.id } })
      for (let u of users) {
        u.joined_at = null
        u.teamId = null
        await u.save()
        await team.removeUser(u.id)
      }
      await team.destroy()
    } else {
      log.info(`User ${user.name} left his team because he paid a visitor place`)
      user.joined_at = null
      user.teamId = null
      await user.save()
      await team.removeUser(user.id)
    }
  }

}
async function handlePayload(models, payload) {
  let { User, Team, Order } = models
  try {
    log.info('PAYLOAD:', payload)
    const params = payload.serviceData.split('/')
    const isInscription = params[0] === 1
    const user = await User.findById(params[2], { include: [Team] })


    if (!user) return { user: null, shouldSendMail: false, error: 'NULL_USER' }
    if (isInscription) {
      if(user.paid) return { user, shouldSendMail: false, error: 'ALREADY_PAID' }
      const userHadPay = user.paid
  
      user.transactionId = payload.transactionId
      user.transactionState = payload.step
      user.paid = payload.paid
      if(user.paid) user.paid_at = moment().format()
      if(user.plusone) await leaveTeam(user, Team, User)
  
      log.info(`user ${user.name} is at state ${user.transactionState}`)
  
      await user.save()
  
      return {
        shouldSendMail: user.paid && !userHadPay,
        user,
        error: null
      }
    }
    else {
      let order = await Order.findById(params[1])
      log.info(order)
    }
  } catch (err) {
    const body = JSON.stringify(payload, null, 2)

    log.info(`handle payload error: ${body}`)
    return { user: null, shouldSendMail: false, error: body}
  }
}

/**
 * POST /user/pay/{callback, success, error}
 * {
 *    etupay data
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = app => {
  app.post('/user/pay/callback', etupay.middleware, async (req, res) => {
    const { shouldSendMail, user, error } = await handlePayload(req.app.locals.models, req.etupay)
    if (error) return res.status(200).end()
    if (shouldSendMail) {
      await sendPdf(user)
      log.info('MAIL SENT TO USER')
    }

    return res
      .status(200)
      .json({})
      .end()
  })

  app.get('/user/pay/return', etupay.middleware, async (req, res, next) => {
    if (req.query.payload) {
      const { shouldSendMail, user, error } = await handlePayload(req.app.locals.models, req.etupay)
      if (error) {
        if(error === 'ALREADY_PAID') return res.redirect(env.ARENA_ETUPAY_SUCCESSURL)
        else return res.redirect(env.ARENA_ETUPAY_ERRORURL)
      }
      if (!user) {
        return res
          .status(404)
          .json({ error: 'USER_NOT_FOUND' })
          .end()
      }
      if (shouldSendMail) {
        await sendPdf(user)
        log.info('MAIL SENT TO USER') //todo
      }
      if(user.transactionState === 'refused') return res.redirect(env.ARENA_ETUPAY_ERRORURL)
      return res.redirect(env.ARENA_ETUPAY_SUCCESSURL)
    }

    next()
  })
}
