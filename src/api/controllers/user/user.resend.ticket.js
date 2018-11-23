const env = require('../../../env')
const log = require ('../../utils/log')(module)
const isAuth = require('../../middlewares/isAuth')
const sendPdf = require('../../utils/sendPDF')
const errorHandler = require('../../utils/errorHandler')

/**
 * GET /user/ticket
 * {
 *
 * }
 *
 */
module.exports = app => {
  app.get('/user/ticket', [isAuth()])
  app.get('/user/ticket', async (req, res) => {
    const { User, Team, Order } = req.app.locals.models
    try{
      const user = await User.findById(req.user.id, { include: [Team, Order] })
      if(!user.paid) return res.status(401).json({ error: 'NOT_PAID' })
      await sendPdf(user)
      return res.status(200).end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
