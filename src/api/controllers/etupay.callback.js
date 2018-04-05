const debug = require('debug')('arena.utt.fr-api:etupay-callback')
const env = require('../../env')
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
      return res.status(404).json({ error: 'USER_NOT_FOUND' }).end()
    }

    user.transactionId = payload.transactionId
    user.transactionState = payload.step
    user.paid = payload.paid

    debug(`user ${user.name} is at state ${user.transactionState}`)

    await user.save()

    return {
      shouldSendMail: (user.paid && !userHadPay),
      user
    }
  } catch (err) {
    const body = JSON.stringify(payload, null, 2)

    debug(`callback error with ${body}`, err)
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
module.exports = (app) => {
  app.post('/user/pay/', etupay.router)


  app.use('/user/pay/callback', async (req, res) => {
    const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.etupay)

    if (shouldSendMail) {
      await sendPdf(user)
    }

    return res
      .status(200)
      .json({ })
      .end()
  })

  app.get('/user/pay/success', async (req, res, next) => {
    if (req.query.payload) {
      const { shouldSendMail, user } = await handlePaylod(req.app.locals.models.User, req.etupay)

      if (shouldSendMail) {
        await sendPdf(user)
      }

      return res.redirect(env.ARENA_ETUPAY_SUCCESSURL)
    }

    next()
  })

  app.get('/user/pay/error', async (req, res, next) => {
    if (req.query.payload) {
      await handlePaylod(req.app.locals.models.User, req.etupay)

      return res.redirect(env.ARENA_ETUPAY_ERRORURL)
    }

    next()
  })
}
