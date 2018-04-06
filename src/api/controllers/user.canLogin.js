const env = require('../../env')

/**
 * GET /user/canLogin
 * {
 *
 * }
 *
 * Response:
 * {
 *    canLogin: Boolean
 * }
 */
module.exports = (app) => {
  app.get('/user/canLogin', async (req, res) => {
    res.status(200).json({ canLogin: !env.ARENA_API_DISABLE_LOGIN }).end()
  })
}
