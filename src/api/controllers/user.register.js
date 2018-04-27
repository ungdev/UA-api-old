const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validateBody = require('../middlewares/validateBody')
const isLoginEnabled = require('../middlewares/isLoginEnabled')
const env = require('../../env')
const random = require('../utils/random')
const { outputFields } = require('../utils/publicFields')
const errorHandler = require('../utils/errorHandler')
const log = require('../utils/log')(module)

const hash = require('util').promisify(bcrypt.hash)

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
    check('fullname')
      .exists()
      .matches(/[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ \-]+/i)
      .isLength({ min: 3, max: 200 }),
    check('password')
      .exists()
      .isLength({ min: 6 }),
    check('email')
      .exists()
      .isEmail(),
    validateBody()
  ])

  app.post('/user', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      req.body.barcode = random(env.ARENA_API_BARCODE_LENGTH)
      req.body.password = await hash(req.body.password, parseInt(env.ARENA_API_BCRYPT_LEVEL, 10))

      const user = await User.create(req.body)

      const token = jwt.sign({ id: user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      log.info(`user ${req.body.name} created`)

      res
        .status(200)
        .json({ token })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
