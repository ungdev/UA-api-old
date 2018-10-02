const env = require('../../env')
const log = require('../utils/log')(module)
const etupay = require('node-etupay')({
  id: env.ARENA_ETUPAY_ID,
  url: env.ARENA_ETUPAY_URL,
  key: env.ARENA_ETUPAY_KEY
})

async function handlePaylod(User, payload) {
  try {
    const user = await User.findById(payload.serviceData)

    const userHadPay = user.paid

    if (!user) {
      return res
        .status(404)
        .json({ error: 'USER_NOT_FOUND' })
        .end()
    }

    user.transactionId = payload.transactionId
    user.transactionState = payload.step
    user.paid = payload.paid

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
    log.info('callback')
    log.info('req.etupay')
    log.info(req.etupay ? 'req.etupay pas undefined !!' : 'undefined :(')
    const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.etupay)
    log.info('shouldSendMail', shouldSendMail)

    if (shouldSendMail) {
      //await sendPdf(user)
      log.info('SEND SMS TO USER') //todo
    }

    return res
      .status(200)
      .json({})
      .end()
  })

  app.get('/user/pay/return', etupay.middleware, async (req, res, next) => {
    log.info('return')
    log.info('req.etupay')
    log.info(req.etupay ? 'req.etupay pas undefined !!' : 'undefined :(')
    if (req.query.payload) {
      const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.etupay)
      log.info('shouldSendMail', shouldSendMail)
      if (shouldSendMail) {
        //await sendPdf(user)
        log.info('SEND SMS TO USER') //todo
      }
      log.info(`redirect to ${env.ARENA_ETUPAY_SUCCESSURL}`)
      return res.redirect(env.ARENA_ETUPAY_SUCCESSURL)
      //return res.redirect(env.ARENA_ETUPAY_ERRORURL)
    }

    next()
  })
}
