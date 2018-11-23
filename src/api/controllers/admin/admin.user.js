const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * PUT /admin/user/:id
 *
 * Response: none
 * 
 */
module.exports = app => {
  app.put('/admin/user/:id', [isAuth(), isAdmin()])

  app.put('/admin/user/:id', async (req, res) => {
    const { Permission } = req.app.locals.models

    try {
      let permission = await Permission.find({
        where: { userId: req.params.id }
      })

      if(req.body.admin !== null && req.params.id !== req.user.id) {
        if(permission) {
          permission.admin = req.body.admin
          await permission.save()
        }
        else {
          await Permission.create({
            userId: req.params.id,
            admin: req.body.admin,
            respo: null
          })
        }
      }

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
