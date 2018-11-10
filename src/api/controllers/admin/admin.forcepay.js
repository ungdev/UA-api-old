const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const sendPdf = require('../../utils/sendPDF')
const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
const log = require('../../utils/log')(module)
const moment = require('moment')

/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {

  app.post('/admin/pay', [isAuth(), isAdmin()])
  app.post('/admin/pay', [
    check('userId')
      .exists(),
    validateBody()
  ])
  app.post('/admin/pay', async (req, res) => {
    const { User, Team, Order } = req.app.locals.models

    try {
      let user = await User.findOne({ where: { id: req.body.userId }, include: [Order] })
      let order = { place: true }
      order.plusone = false
      order.ethernet = false
      order.ethernet7 = false
      order.tombola = 0
      order.kaliento = false
      order.mouse = false
      order.keyboard = false
      order.headset = false
      order.screen24 = false
      order.screen27 = false
      order.chair = false
      order.gamingPC = false
      order.streamingPC = false
      order.laptop = false
      order.shirt = 'none'

      order.transactionState = 'paid'
      order.paid = true
      order.paid_at = moment().format()

      user.paid = true
      user.paid_at = moment().format()
      user.plusone = false

      order = await Order.create(order)
      order.setUser(user)
      await user.save()
      await order.save()
      log.info(`Forced ${user.name}'s payment`)
      user = await User.findById(user.id, { include: [Team, Order] }) //add order to user
      await sendPdf(user)
      log.info(`Mail sent to ${user.name}`)
      return res
        .status(200)
        .json(user)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
