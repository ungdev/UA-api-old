const errorHandler = require('../../utils/errorHandler')
const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /admin/users
 *
 * Response:
 * [
 *    { id, name, firstname, lastname, email, paid, teamId, spotlightId, permission, orders }, ...
 * ]
 */
module.exports = app => {
  app.get('/admin/users', [isAuth(), isAdmin()])

  app.get('/admin/users', async (req, res) => {
    const { User, Team, Order, Permission } = req.app.locals.models

    try {
      const users = await User.findAll({
        include: [Team, Order, Permission],
        order: [
          ['name', 'ASC']
        ]
      })

      let usersData = users.map(user => {
        // Get user orders
        let orders = user.orders.map(order => {
          return {
            paid: order.paid,
            paid_at: order.paid_at,
            transactionState: order.transactionState,
            place: order.place,
            plusone: order.plusone,
            material: {
              ethernet: order.ethernet,
              ethernet7: order.ethernet7,
              kaliento: order.kaliento,
              mouse: order.mouse,
              keyboard: order.keyboard,
              headset: order.headset,
              screen24: order.screen24,
              screen27: order.screen27,
              chair: order.chair,
              gamingPC: order.gamingPC,
              streamingPC: order.streamingPC,
              laptop: order.laptop,
              tombola: order.tombola,
              shirt: order.shirt
            }
          }
        })

        // Get user permission
        let permission = {
          respo: user.permission ? user.permission.respo : null,
          admin: user.permission ? user.permission.admin : false,
        }

        return {
          id: user.id,
          name: user.name,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          paid: user.paid,
          teamId: user.team ? user.team.id : '/',
          team: user.team ? user.team.name : '/',
          spotlightId: user.team ? user.team.spotlightId : '/',
          permission,
          orders,
          place: user.tableLetter + user.placeNumber
        }
      })

      return res
        .status(200)
        .json(usersData)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
