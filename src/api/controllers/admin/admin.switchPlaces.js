const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * PUT /admin/switchPlaces/:id1/:id2
 *
 * Response: none
 * 
 */
module.exports = app => {
  app.put('/admin/switchPlaces/:id1/:id2', [isAuth(), isAdmin()])

  app.put('/admin/switchPlaces/:id1/:id2', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      if(req.body.id1 === null || req.body.id2 === null) {
        return res
        .status(400)  // Bad request
        .json({ error: 'BAD_REQUEST' })
        .end()
      }

      let user1 = await User.findById(req.params.id1)
      let user2 = await User.findById(req.params.id2)

      let tmpTableLetter = user1.tableLetter
      let tmpPlaceNumber = user1.placeNumber

      user1.tableLetter = user2.tableLetter
      user1.placeNumber = user2.placeNumber
      
      user2.tableLetter = tmpTableLetter
      user2.placeNumber = tmpPlaceNumber

      await user1.save()
      await user2.save()

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
