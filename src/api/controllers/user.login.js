const debug = require('debug')('arena.utt.fr-api:user-login')
const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const errorHandler = require('../utils/errorHandler')
const { outputFields } = require('../utils/publicFields')
const validateBody = require('../middlewares/validateBody')
const isLoginEnabled = require('../middlewares/isLoginEnabled')
const env = require('../../env')

/**
 * POST /user/login
 * {
 *    name: String
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
    check('name')
      .exists()
      .isAlphanumeric(),
    check('password').exists(),
    validateBody()
  ])

  app.put('/user/login', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      const username = req.body.name
      const password = req.body.password


      const user = await User.findOne({
        where: {
          [Op.or]: [
            { name: username },
            { email: username }
          ]
        }
      })

      if (!user) {
        debug(`user ${username} couldn't be found`)

        return res
          .status(400)
          .json({ error: 'INVALID_USERNAME' })
          .end()
      }

      const passwordMatches = await bcrypt.compare(password, user.password)

      if (!passwordMatches) {
        return res
          .status(400)
          .json({ error: 'INVALID_PASSWORD' })
          .end()
      }

      const token = jwt.sign({ id: user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      debug(`user ${user.name} logged`)

      res
        .status(200)
        .json({ user: outputFields(user), token })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
