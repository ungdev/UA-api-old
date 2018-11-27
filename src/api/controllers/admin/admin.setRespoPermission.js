const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * PUT /admin/setRespoPermission/:id
 *
 * Response: none
 *
 */
module.exports = app => {
  app.put('/admin/setRespoPermission/:id', [isAuth(), isAdmin()])

  app.put('/admin/setRespoPermission/:id', async (req, res) => {
    const { Permission } = req.app.locals.models

    try {
      if (req.body.respoPermission === null) {
        return res
          .status(400) // Bad request
          .json({ error: 'BAD_REQUEST' })
          .end()
      }

      let permission = await Permission.find({
        where: { userId: req.params.id }
      })

      if (permission) {
        permission.respo = req.body.respoPermission.toString()
        await permission.save()
      } else {
        await Permission.create({
          userId: req.params.id,
          admin: null,
          respo: req.body.respoPermission.toString()
        })
      }

      return res.status(200).end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
