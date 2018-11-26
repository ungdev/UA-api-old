const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * PUT /admin/setrespo/:id
 *
 * Response: none
 * 
 */
module.exports = app => {
  app.put('/admin/setrespo/:id', [isAuth(), isAdmin()])

  app.put('/admin/setrespo/:id', async (req, res) => {
    const { Permission } = req.app.locals.models

    try {
      if(req.body.admin === null) {
        return res
        .status(400)  // Bad request
        .json({ error: 'BAD_REQUEST' })
        .end()
      }
      else if(req.params.id === req.user.id) {
        return res
        .status(403)  // Forbidden
        .json({ error: 'NOT_ALLOWED' })
        .end()
      }

      let permission = await Permission.find({
        where: { userId: req.params.id }
      })

      if(permission) {
        permission.respo = req.body.respo
        await permission.save()
      }
      else {
        await Permission.create({
          userId: req.params.id,
          admin: null,
          respo: req.body.admin
        })
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
