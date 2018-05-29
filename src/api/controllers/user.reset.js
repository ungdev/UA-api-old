const { check } = require('express-validator/check')
const uuid = require('uuid')
const validateBody = require('../middlewares/validateBody')
const mail = require('../mail')
const env = require('../../env')
const errorHandler = require('../utils/errorHandler')
const log = require('../utils/log')(module)

/**
 * POST /user/reset
 * {
 *    email: String
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = app => {
  app.post('/user/reset', [check('email').exists().isEmail(), validateBody()])

  app.post('/user/reset', async (req, res) => {
    const { User } = req.app.locals.models
    const email = req.body.email

    try {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        log.warn(`can not reset ${email}, user not found`)

        return res
          .status(400)
          .json({ error: 'INVALID_EMAIL' })
          .end()
      }

      user.resetToken = uuid()
      await user.save()
      await mail('user.reset', user.email, {
        mail: user.email,
        link: `${env.ARENA_WEBSITE}/reset/${user.resetToken}`
      })

      log.info(`user ${user.name} asked for mail reset`)

      res
        .status(200)
        .json({ })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
