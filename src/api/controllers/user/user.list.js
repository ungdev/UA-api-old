const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /users
 *
 * Response:
 * [
 *    {
 *      id, name, firstname, lastname, email, paid, teamId, material, permissions
 *    },
 *    ...
 * ]
 */
module.exports = app => {
  app.get('/users', [isAuth(), isAdmin()])

  app.get('/users', async (req, res) => {
    const { User, Team, Permission } = req.app.locals.models

    try {
      let users = await User.findAll({
        include: [
          {
            model: Team
          }
        ]
      })
      users = users.map(async (user) => {
        let permissions = await Permission.findOne({
          where: {
            userId: user.id
          }
        })

        return {
          id: user.id,
          name: user.name,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          paid: user.paid,
          teamId: user.team ? user.team.id : '/',
          material: {
            ethernet: user.ethernet,
            ethernet7: user.ethernet7,
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
            shirt: user.shirt
          },
          permissions: permissions
        }
      })
      return res
        .status(200)
        .json(users)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
