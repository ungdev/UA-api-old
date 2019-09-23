const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const env = require('../../../env')
const log = require('../../utils/log')(module)
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const validateBody = require('../../middlewares/validateBody')
const isLoginEnabled = require('../../middlewares/isLoginEnabled')

/**
 * PUT /user/login
 * {
 *    username: String
 *    password: String
 * }
 *
 * Response:
 * {
 *    user: User,
 *    token: String
 * }
 */
module.exports = app => {
  app.put('/user/login', [isLoginEnabled()])

  app.put('/user/login', [
    check('username')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ \-]+/i),
    check('password')
      .exists(),
    validateBody()
  ])

  app.put('/user/login', async (req, res) => {
    const { User, Network } = req.app.locals.models

    try {
      const { username, password } = req.body

      // Get user
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: username }]
        }
      })

      if (!user) {
        log.warn(`user ${username} couldn't be found`)

        return res
          .status(400)
          .json({ error: 'INVALID_USERNAME' })
          .end()
      }

      // Check for password
      const passwordMatches = await bcrypt.compare(password, user.password)

      if (!passwordMatches) {
        log.warn(`user ${username} password didn't match`)

        return res
          .status(400)
          .json({ error: 'INVALID_PASSWORD' })
          .end()
      }

      // Check if account is activated
      if (user.registerToken) {
        log.warn(`user ${username} tried to login before activating`)

        return res
          .status(400)
          .json({ error: 'USER_NOT_ACTIVATED' })
          .end()
      }

      // Generate new token
      const token = jwt.sign({ id: user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })


      log.info(`user ${user.name} logged`)

      res
        .status(200)
        .json({ user: outputFields(user), token })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
