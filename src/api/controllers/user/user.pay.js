const jwt = require('jsonwebtoken')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
const isAuth = require('../../middlewares/isAuth')
const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const etupay = require('@ung/node-etupay')({
  id: env.ARENA_ETUPAY_ID,
  url: env.ARENA_ETUPAY_URL,
  key: env.ARENA_ETUPAY_KEY
})

const Basket = etupay.Basket

const euro = 100
const gender = { H: 'Homme', F: 'Femme' }

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
    check('ethernet7')
      .exists()
      .isBoolean(),
    check('tombola')
      .optional(),
    check('shirtGender')
      .optional()
      .isIn(['H', 'F']),
    check('shirtSize')
      .optional()
      .isIn(['XS', 'S', 'M', 'L', 'XL']),
    check('kaliento')
      .optional(),
    check('mouse')
      .optional(),
    check('keyboard')
      .optional(),
    check('headset')
      .optional(),
    check('screen24')
      .optional(),
    check('screen27')
      .optional(),
    check('chair')
      .optional(),
    check('gamingPC')
      .optional(),
    check('streamingPC')
      .optional(),
    check('laptop')
      .optional(),
    validateBody()
  ])

  app.post('/user/pay', async (req, res) => {
    try {
      if (req.user.paid) return res.status(404).json('ALREADY PAID').end()
      if (req.body.plusone) {
        const count = await req.app.locals.models.User.count({ where: { plusone: true } })
        if (count >= env.ARENA_VISITOR_LIMIT) return res.status(404).json({ error: 'VISITOR_FULL'}).end()
      }
      // step 1 : save user's payment profile (place type, shirt, ethernet cable)
      req.user.plusone = req.body.plusone ? req.body.plusone : false
      req.user.ethernet = req.body.ethernet ? req.body.ethernet : false
      req.user.ethernet7 = req.body.ethernet7 ? req.body.ethernet7 : false
      req.user.tombola = req.body.tombola ? req.body.tombola : 0
      req.user.kaliento = req.body.kaliento ? req.body.kaliento : false
      req.user.mouse = req.body.mouse ? req.body.mouse : false
      req.user.keyboard = req.body.keyboard ? req.body.keyboard : false
      req.user.headset = req.body.headset ? req.body.headset : false
      req.user.screen24 = req.body.screen24 ? req.body.screen24 : false
      req.user.screen27 = req.body.screen27 ? req.body.screen27 : false
      req.user.chair = req.body.chair ? req.body.chair : false
      req.user.gamingPC = req.body.gamingPC ? req.body.gamingPC : false
      req.user.streamingPC = req.body.streamingPC ? req.body.streamingPC : false
      req.user.laptop = req.body.laptop ? req.body.laptop : false
      req.user.shirt = 'none'

      if (req.body.shirtGender && req.body.shirtSize) {
        req.user.shirt = req.body.shirtGender.toLowerCase() + req.body.shirtSize.toLowerCase()
      }
      await req.user.save()

      // step 2 : determine price (based on profile + mail)
      const partnerPrice = env.ARENA_PRICES_PARTNER_MAILS.split(',').some(partner =>
        req.user.email.toLowerCase().endsWith(partner)
      )

      let price = partnerPrice ? env.ARENA_PRICES_PARTNER : env.ARENA_PRICES_DEFAULT

      const basket = new Basket(
        'Inscription UTT Arena 2018',
        req.user.firstname,
        req.user.lastname,
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
      if (req.user.ethernet) basket.addItem('Cable Ethernet 5m', euro * env.ARENA_PRICES_ETHERNET, 1)
      if (req.user.ethernet7) basket.addItem('Cable Ethernet 7m', euro * env.ARENA_PRICES_ETHERNET7, 1)
      if (req.user.kaliento) basket.addItem('Location Kaliento', euro * env.ARENA_PRICES_KALIENTO, 1)
      if (req.user.mouse) basket.addItem('Location Souris', euro * env.ARENA_PRICES_MOUSE, 1)
      if (req.user.keyboard) basket.addItem('Location Clavier', euro * env.ARENA_PRICES_KEYBOARD, 1)
      if (req.user.headset) basket.addItem('Location Casque', euro * env.ARENA_PRICES_HEADSET, 1)
      if (req.user.screen24) basket.addItem('Location Ecran 24"', euro * env.ARENA_PRICES_SCREEN24, 1)
      if (req.user.screen27) basket.addItem('Location Ecran 27"', euro * env.ARENA_PRICES_SCREEN27, 1)
      if (req.user.chair) basket.addItem('Location Chaise Gaming', euro * env.ARENA_PRICES_CHAIR, 1)
      if (req.user.gamingPC) basket.addItem('Location PC Gaming', euro * env.ARENA_PRICES_GAMING_PC, 1)
      if (req.user.streamingPC) basket.addItem('Location PC Streaming', euro * env.ARENA_PRICES_STREAMING_PC, 1)
      if (req.user.laptop) basket.addItem('Location PC Portable', euro * env.ARENA_PRICES_LAPTOP, 1)
      if (req.user.tombola > 0) basket.addItem('Tombola', euro * env.ARENA_PRICES_TOMBOLA, req.user.tombola)
      if (req.user.shirt !== 'none') {
        basket.addItem(
          `T-Shirt ${gender[req.body.shirtGender]} ${req.body.shirtSize}`,
          euro * env.ARENA_PRICES_SHIRT,
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
