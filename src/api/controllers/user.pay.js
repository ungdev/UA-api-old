const jwt = require('jsonwebtoken')
const { check } = require('express-validator/check')
const validateBody = require('../middlewares/validateBody')
const isAuth = require('../middlewares/isAuth')
const env = require('../../env')
const errorHandler = require('../utils/errorHandler')
const etupay = require('node-etupay')({
  id: env.ARENA_ETUPAY_ID,
  url: env.ARENA_ETUPAY_URL,
  key: env.ARENA_ETUPAY_KEY
})

const Basket = etupay.Basket

const euro = 100
const gender = { M: 'Homme', F: 'Femme' }

/**
 * GET /user/pay
 * {
 *    plusone: Boolean,
 *    ethernet: Boolean,
 *    shirtGender: String?,
 *    shirtSize: String?
 * }
 *
 * Response:
 * {
 *    url: String
 * }
 */
module.exports = app => {
  app.post('/user/pay', [isAuth('user-pay')])

  app.post('/user/pay', [
    check('plusone')
      .exists()
      .isBoolean(),
    check('ethernet')
      .exists()
      .isBoolean(),
    check('shirtGender')
      .optional()
      .isIn(['M', 'F']),
    check('shirtSize')
      .optional()
      .isIn(['XS', 'S', 'M', 'L', 'XL'])
  ])

  app.post('/user/pay', async (req, res) => {
    try {
      // step 1 : save user's payment profile (place type, shirt, ethernet cable)
      req.user.plusone = !!req.body.plusone
      req.user.ethernet = !!req.body.ethernet
      req.user.shirt = 'none'

      if (req.body.shirtGender && req.body.shirtSize) {
        req.user.shirt = req.body.shirtGender.toLowerCase() + req.body.shirtSize.toLowerCase()
      }

      await req.user.save()

      // step 2 : determine price (based on profile + mail)
      const partnerPrice = env.ARENA_PRICES_PARTNER_MAILS
        .split(',')
        .some(partner => req.user.email.toLowerCase().endsWith(partner))

      let price = partnerPrice
        ? env.ARENA_PRICES_PARTNER
        : env.ARENA_PRICES_DEFAULT

      const basket = new Basket(
        'Inscription UTT Arena 2018',
        req.user.fullname.split(' ')[0],
        req.user.fullname.split(' ').slice(1).join(' '),
        req.user.email,
        'checkout',
        req.user.id
      )

      if (req.body.plusone) {
        basket.addItem(
          'Place UTT Arena Visiteur/Accompagnateur',
          euro * env.ARENA_PRICES_PLUSONE,
          1
        )
      } else {
        basket.addItem('Place UTT Arena', euro * price, 1)
      }

      if (req.user.ethernet) {
        basket.addItem('Cable Ethernet 7m', euro * ARENA_PRICES_ETHERNET, 1)
      }

      if (req.user.shirt !== 'none') {
        basket.addItem(
          `T-Shirt ${sex[req.body.shirtGender]} ${req.body.shirtSize}`,
          euro * config.prices.shirt,
          1
        )
      }

      return res
        .status(200)
        .json({ url: basket.compute() })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
