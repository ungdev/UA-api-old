const debug = require('debug')('arena.utt.fr-api:user-edit')
const { check } = require('express-validator/check')
const errorHandler = require('../utils/errorHandler')
const { outputFields, inputFields } = require('../utils/publicFields')
const validateBody = require('../middlewares/validateBody')
const isAuth = require('../middlewares/isAuth')
const env = require('../../env')

/**
 * PUT /user
 * {
 *    name: String
 *    email: String
 *    [password]: String
 * }
 *
 * Response:
 * {
 *    user: User
 * }
 */
module.exports = (app) => {
  app.put('/user', [
    isAuth('user-edit')
  ])

  app.put('/user', [
    check('name').exists().isAlphanumeric().isLength({ min: 3, max: 90 }),
    check('password').optional().isLength({ min: 6 }),
    check('email').exists().isEmail(),
    validateBody()
  ])

  app.put('/user', async (req, res) => {
    try {
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, env.ARENA_API_BCRYPT_LEVEL)
      }

      const body = inputFields(req.body)

      await req.user.update(body)

      debug(`user ${req.body.name} updated`)

      res.status(200).json({ user: outputFields(req.user) }).end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
