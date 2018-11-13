const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {

  app.get('/admin/data', [isAuth(), isAdmin()])
  app.get('/admin/data', async (req, res) => {
    const { User, Order } = req.app.locals.models
    try {
        
      let users = await User.findAll()
      let orders = []
      users = await Promise.all(users.map(async user => {
        if(user.transactionState || user.paid){
          let order = await Order.create({
            place: true,
            paid_at: user.paid_at,
            plusone: user.plusone,
            ethernet: user.ethernet,
            ethernet7: user.ethernet7,
            shirt: user.shirt,
            kaliento: user.kaliento,
            mouse: user.mouse,
            keyboard: user.keyboard,
            headset: user.headset,
            screen24: user.screen24,
            screen27: user.screen27,
            chair: user.chair,
            gamingPC: user.gamingPC,
            streamingPC: user.streamingPC,
            laptop: user.laptop,
            tombola: user.tombola,
            transactionId: user.transactionId,
            transactionState: user.transactionState,
            paid: user.paid,
          })
          await order.setUser(user)
          orders.push({ id: order.id})
        }
        return { name: user.name }

      }))

      let t = await User.findAll({ include: [Order] })
    
      return res
        .status(200)
        .json({t, users, orders})
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
