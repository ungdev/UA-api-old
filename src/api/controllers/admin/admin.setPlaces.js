const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * POST /admin/setPlaces
 *
 * Response: none
 * 
 */
module.exports = app => {
  app.post('/admin/setPlaces', [isAuth(), isAdmin()])

  app.post('/admin/setPlaces', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      const places = req.body.places

      places.forEach(async (place) => {
        let user = await User.findById(place.id)
        if(user) {
          user.tableLetter = (place.tableLetter && place.tableLetter !== '') ? place.tableLetter : null
          user.placeNumber = (place.placeNumber && place.placeNumber !== '') ? place.placeNumber : null
          await user.save()
        }
      })

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
