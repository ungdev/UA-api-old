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
  app.get('/admin/users', [isAuth(), isAdmin()])

  app.get('/admin/users', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      let users = await User.findAll({})
      users = users.map(user => {
        return {
          id: user.id,
          name: user.name,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          paid: user.paid,
        }
      })
      return res
        .status(200)
        .json(users)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
