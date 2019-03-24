const errorHandler = require('../../utils/errorHandler')
const isRespo = require('../../middlewares/isRespo')
const isAuth = require('../../middlewares/isAuth')
const log = require ('../../utils/log')(module)

module.exports = app => {
  app.delete('/infos/:id/:infoId', [isAuth(), isRespo()])
  app.delete('/infos/:id/:infoId', async (req, res) => {
    const { Info } = req.app.locals.models

    try {
      const info = await Info.findByPk(req.params.infoId)

      if(info.spotlightId !== parseInt(req.params.id)) {
        return res
          .status(400)
          .json({error: 'BAD_REQUEST'})
          .end()
      }
      
      await info.update({
        deleted: true
      })

      return res
        .status(200)
        .json(info)
        .end()
      
    } catch (err) {
      errorHandler(err, res)
    }
  })
}

