const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
const isAuth = require('../../middlewares/isAuth')
const moment = require('moment')

/**
 * GET /users
 *
 * Response:
 * [
 *    
 * ]
 */
module.exports = app => {
  app.post('/admin/chart', [isAuth(), isAdmin()])
  app.post('/admin/chart', [
    check('start')
      .exists(),
    check('end')
      .exists(),
    check('step')
      .exists(),
    validateBody()
  ])
  app.post('/admin/chart', async (req, res) => {
    const { User, Order } = req.app.locals.models
    const { start, end, step } = req.body
    try {
      let totalPaidPlayers = await User.findAll({
          where: {
            paid: 1,
            plusone: 0,
          },
          include: [Order]
      })
      totalPaidPlayers = totalPaidPlayers.map(user => {
        const paid_at = user.orders.find(order => order.paid && order.place).paid_at //the case where the find is undefined should not happen, because we filtered only paid users
        return { ...user, paid_at } // adding paid_at to user
      })
      totalPaidPlayers = totalPaidPlayers.filter(user => moment(user.paid_at).isAfter(start) && moment(user.paid_at).isBefore(end))
      let result = []
      let format = 'YYYY-MM-DD'
      let adding = 'days'
      switch (step) {
        case 'hour':
          format = 'YYYY-MM-DD-HH'
          adding = 'hours'
          break
        default:
          break
      }
        let current = moment(start)
        const ending = moment(end)
        let i = 0
        let count = 0
        while (i < 100 && !current.isAfter(ending)) {
          i++
          totalPaidPlayers.forEach(user => {
            if(moment(user.paid_at).format(format) === current.format(format))
              count++
          })
          result.push({
            time: current.format('DD/MM'),
            count
          })
          current = current.add(1, adding)
        }
      return res
        .status(200)
        .json(result)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}