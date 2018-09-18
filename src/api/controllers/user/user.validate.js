const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const validateBody = require('../../middlewares/validateBody')
const mail = require('../../mail')
const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * POST /user/validate
 * {
 *    email: String
 * }
 *
 * Response:
 * {
 *    token: String
 * }
 *
 */
module.exports = app => {
  app.post('/user/validate', [
    check('token')
      .exists()
      .isUUID(),
    validateBody()
  ])

  app.post('/user/validate', async (req, res) => {
    const { User } = req.app.locals.models
    const registerToken = req.body.token

    try {
      const user = await User.findOne({ where: { registerToken } })

      if (!user) {
        log.warn(`can not validate ${registerToken}, user not found`)

        return res
          .status(400)
          .json({ error: 'INVALID_TOKEN' })
          .end()
      }

      user.registerToken = null
      await user.save()

      log.info(`user ${user.name} was validated`)

      const token = jwt.sign({ id: user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      log.info(`user ${user.name} logged`)

      res
        .status(200)
        .json({ token })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
