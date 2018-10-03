const env = require('../../env')
const log = require('../utils/log')(module)
const moment = require('moment')
const sendPdf = require('../utils/sendPDF')
const etupay = require('@ung/node-etupay')({
  id: env.ARENA_ETUPAY_ID,
  url: env.ARENA_ETUPAY_URL,
  key: env.ARENA_ETUPAY_KEY
})

async function handlePaylod(User, payload) {
  try {
    const user = await User.findById(payload.serviceData)


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
    const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.etupay)

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
      const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.etupay)
      if (shouldSendMail) {
        //await sendPdf(user)
        log.info('MAIL SENT TO USER') //todo
      }
      if(user.transactionState === 'refused') return res.redirect(env.ARENA_ETUPAY_ERRORURL)
      return res.redirect(env.ARENA_ETUPAY_SUCCESSURL)
    }

    next()
  })
}
