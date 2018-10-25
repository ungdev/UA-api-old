const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /users
 *
 * Response:
 * [
 *    {
 *      id, name, isAdmin, firstname, lastname, mail, team, spotlightId, material
 *    },
 *    ...
 * ]
 */
module.exports = app => {
  app.get('/users', [isAuth(), isAdmin()])

  app.get('/users', async (req, res) => {
    const { User, Team } = req.app.locals.models

    try {
      let users = await User.findAll({
        include: [
          {
            model: Team
          }
        ]
      })
      users = users.map(user => {
        return {
          id: user.id,
          name: user.name,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          respo: user.respo,
          isAdmin: user.isAdmin,
          paid: user.paid,
          team: user.team ? user.team.name : '/',
          spotlightId: user.team ? user.team.spotlightId : '/',
          material: {
            //shirt: user.shirt,
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
            tombola: user.tombola
          }
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
