const errorHandler = require('../../utils/errorHandler')
const sendPdf = require('../../utils/sendPDF')
const log = require('../../utils/log')(module)

module.exports = app => {

  app.get('/sendmail/:id', async (req, res) => {
    const { User } = req.app.locals.models
    log.info('yolo')
    try {
      let user = await User.findById(req.params.id, {})
      await sendPdf(user)
      return res
        .status(200)
        .json(user)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
