const errorHandler = require('../../utils/errorHandler')
const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /admin/users
 *
 * Response:
 * [
 *    { id, name, firstname, lastname, email, paid, teamId, spotlightId, permission, orders }, ...
 * ]
 */
module.exports = app => {
  app.put('/validate', [isAuth(), isAdmin()]) // change isAdmin with permission

  app.put('/validate', async (req, res) => {
    const { User, Order } = req.app.locals.models

    try {
      if(!req.body.barcode && !req.body.name ) return res.status(400).json({ error: 'MISSING_PARAMS' })
      let user = null
      if (req.body.barcode) {
        const barcode = req.body.barcode.substr(0, req.body.barcode.length - 1)
        user = await User.findOne({
          where: { barcode },
          include: [{
            model: Order,
          }]
        })
      }
      if (!user && req.body.name) {
        user = await User.findOne({
          where: { name: req.body.name },
          include: [{
            model: Order,
          }]
        })
      }
      if (!user) return res.status(404).json({ error: 'NOT_FOUND' })

      return res
        .status(200)
        .json(user)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
