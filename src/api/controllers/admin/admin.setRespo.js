const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * PUT /admin/setRespo/:id
 *
 * Response: none
 *
 */
module.exports = app => {
  app.put('/admin/setRespo/:id', [isAuth(), isAdmin()])

  app.put('/admin/setRespo/:id', async (req, res) => {
    const { Permission } = req.app.locals.models

    try {
      if (req.body.respo === null) {
        return res
          .status(400) // Bad request
          .json({ error: 'BAD_REQUEST' })
          .end()
      }

      let permission = await Permission.find({
        where: { userId: req.params.id }
      })

      if (permission) {
        permission.respo = req.body.respo.toString()
        await permission.save()
      } else {
        await Permission.create({
          userId: req.params.id,
          admin: null,
          respo: req.body.respo.toString()
        })
      }

      return res.status(200).end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
