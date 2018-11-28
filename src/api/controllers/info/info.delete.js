const errorHandler = require('../../utils/errorHandler')
const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const log = require ('../../utils/log')(module)

module.exports = app => {
  app.delete('/infos/:id', [isAuth(), isRespo()])
  app.delete('/infos/:id', async (req, res) => {
    const { Info } = req.app.locals.models

    try {

      const info = await Info.findById(req.params.id)
      info.deleted = true
      await info.save()
      return res
        .status(200)
        .json(info)
        .end()
      
    } catch (err) {
      errorHandler(err, res)
    }
  })
}

