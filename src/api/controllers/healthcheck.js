const { check } = require('express-validator/check')
const validateBody = require('../middlewares/validateBody')
const isAuth = require('../middlewares/isAuth')
const isNotInTeam = require('../middlewares/isNotInTeam')

/**
 * GET /
 *
 * Response:
 * {
 *    db: Boolean
 *    http: Boolean
 * }
 */
module.exports = app => {
  app.get('/status?', async (req, res) => {
    let db = 1
    let http = 1

    try {
      await app.locals.db.authenticate()
    } catch (err) {
      db = 0
    }

    res
      .status(200)
      .json({
        db,
        http
      })
      .end()
  })
}
