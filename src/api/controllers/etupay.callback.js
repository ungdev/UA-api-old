const env = require('../../env')
const log = require('../utils/log')(module)
const moment = require('moment')
const sendPdf = require('../utils/sendPDF')
const etupay = require('@ung/node-etupay')({
  id: env.ARENA_ETUPAY_ID,
  url: env.ARENA_ETUPAY_URL,
  key: env.ARENA_ETUPAY_KEY
})
async function leaveTeam(user) {
  let team = { user }
  if(user.team){
    if (team.captainId === user.id) {
      log.info(`user ${user.name} left ${team.name} and destroyed it, as captain`)
      let users = await User.findAll({ where: { teamId: team.id } })
      for(let u of users) {
        u.joined_at = null
        u.teamId = null
        await u.save()
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
async function handlePaylod(User, Team, payload) {
  try {
    const user = await User.findById(payload.serviceData, { include: [Team] })


    if (!user) {
      return res
        .status(404)
        .json({ error: 'USER_NOT_FOUND' })
        .end()
    }
    const userHadPay = user.paid

    user.transactionId = payload.transactionId
    user.transactionState = payload.step
    user.paid = payload.paid
    if(user.paid) user.paid_at = moment().format()
    if(user.plusone) await leaveTeam(user)

    log.info(`user ${user.name} is at state ${user.transactionState}`)

    await user.save()

    return {
      shouldSendMail: user.paid && !userHadPay,
      user
    }
  } catch (err) {
    const body = JSON.stringify(payload, null, 2)

    log.info(`handle payload error: ${body}`)
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
    const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.app.locals.models.Team, req.etupay)

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
      const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.app.locals.models.Team, req.etupay)
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
