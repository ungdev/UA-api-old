const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * GET /users
 *
 * Response:
 * [
 *    {
 *      id, name, isAdmin, firstname, lastname, mail, team, spotlightId
 *    },
 *    ...
 * ]
 */
module.exports = app => {
  app.get('/users', [isAdmin()])

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
          team: user.team ? user.team.name : '/',
          spotlightId: user.team ? user.team.spotlightId : '/'
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
