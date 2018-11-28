const errorHandler = require('../../utils/errorHandler')
const isRespo = require('../../middlewares/isRespo')
const isAuth = require('../../middlewares/isAuth')
const log = require ('../../utils/log')(module)

module.exports = app => {
  app.delete('/infos/:id', [isAuth(), isRespo()])
  app.delete('/infos/:id', async (req, res) => {
    const { Info } = req.app.locals.models

    try {
      log.info(JSON.stringify(req))
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

