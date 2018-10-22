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

  //app.get('/admin/data', [isAuth(), isAdmin()])
  app.get('/admin/compare', async (req, res) => {
    const { User, Order } = req.app.locals.models
    try {
        
      let count1 = await User.count({ where: { paid: 1 } })
      let count2 = await Order.count({ where: { paid: 1 } })
      
      return res
        .status(200)
        .json({ count1, count2})
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
