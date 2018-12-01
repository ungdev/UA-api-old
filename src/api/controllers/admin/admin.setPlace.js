const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * PUT /admin/setPlace/:id
 *
 * Response: none
 * 
 */
module.exports = app => {
  app.put('/admin/setPlace/:id', [isAuth(), isAdmin()])

  app.put('/admin/setPlace/:id', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      const placeLetter = req.body.placeLetter
      const placeNumber = req.body.placeNumber

      if(placeLetter === null || placeNumber === null || placeLetter.length > 1) {
        return res
        .status(400)  // Bad request
        .json({ error: 'BAD_REQUEST' })
        .end()
      }

      let user = await User.findById(req.params.id)
      user.tableLetter = placeLetter || null
      user.placeNumber = placeNumber || null
      await user.save()

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
