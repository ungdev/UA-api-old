const debug = require('debug')('arena.utt.fr-api:user-register')
const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const errorHandler = require('../utils/errorHandler')
const { outputFields } = require('../utils/publicFields')
const validateBody = require('../middlewares/validateBody')
const isLoginEnabled = require('../middlewares/isLoginEnabled')
const env = require('../../env')

/**
 * POST /user
 * {
 *    name: String
 *    password: String
 *    email: String
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = app => {
  app.post('/user', [isLoginEnabled()])

  app.post('/user', [
    check('name')
      .exists()
      .isAlphanumeric()
      .isLength({ min: 3, max: 90 }),
    check('password')
      .optional()
      .isLength({ min: 6 }),
    check('email')
      .exists()
      .isEmail(),
    validateBody()
  ])

  app.put('/user', async (req, res) => {
    try {
      req.body.barcode = random(config.app.barcodeLength)
      req.body.password = await bcrypt.hash(req.body.password, config.app.bcryptLevel)
      await User.create(req.body)

      debug(`user ${req.body.name} created`)

      res
        .status(200)
        .json({})
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
