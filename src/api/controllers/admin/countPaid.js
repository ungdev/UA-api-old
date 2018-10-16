const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /users
 *
 * Response:
 * [
 *    
 * ]
 */
module.exports = app => {
  app.get('/admin/paids', [isAuth(), isAdmin()])

  app.get('/admin/paids', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      let visiteur = await User.count({
          where:{ paid: 1, plusone: 1}
      })
      let joueur = await User.count({
          where: { paid: 1, plusone: 0}
      })
      let notPaid = await User.count({
          where: { paid: 0}
      })

      let counts = [visiteur, joueur, notPaid]
      return res
        .status(200)
        .json(counts)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
