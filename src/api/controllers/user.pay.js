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
      const mail = req.user.email.toLowerCase()
      const domain = mail.slice(mail.lastIndexOf('@') + 1)
      let price = env.ARENA_PRICES_PARTNER_MAILS.split(',').contains(domain)
        ? env.ARENA_PRICES_PARTNER
        : env.ARENA_PRICES_DEFAULT

      const basket = new Basket(
        // description
        'Inscription UTT Arena 2017',
        // firstname
        req.user.firstname,
        // lastname
        req.user.lastname,
        // email
        req.user.email,
        // type
        'checkout',
        // service_data
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
