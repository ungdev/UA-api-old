const sendPDF = require('../../utils/sendPDF')
const errorHandler = require('../../utils/errorHandler')

/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {

  app.get('/mail/:name', [isAuth(), isAdmin()])
  app.get('/mail/:name', async (req, res) => {
    const { User } = req.app.locals.models

    try {
      let user = await User.findOne({ where: { name: req.params.name } })
      await sendPDF(user)

      return res
        .status(200)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
