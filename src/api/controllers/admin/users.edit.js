const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {
  app.put('/users/:id', [isAuth(), isAdmin()])

  app.put('/users/:id', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      let user = await User.findById(req.params.id)
      if(req.body.isAdmin !== null){
        req.body.isAdmin === 100 ? user.isAdmin = 100 : user.isAdmin = 0
      }

      await user.save()
      return res
        .status(200)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
