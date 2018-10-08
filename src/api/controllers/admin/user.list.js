const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

/**
 * GET /users
 *
 * Response:
 * [
 *    
 * ]
 */
module.exports = app => {
  app.get('/admin/users', [isAuth(), isAdmin()])

  app.get('/admin/users', async (req, res) => {
    const { User, Team, Spotlight } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findAll({
        include: [
          {
            model: Team,
            include: [
              {
                model: User
              }
            ]
          }
        ]
      })
      spotlights = spotlights.map(spotlight => {
        spotlight.teams = spotlight.teams.map(team => {
          team.users = team.users.map(user => {
            return {
              id: user.id,
              name: user.name,
              paid: user.paid
            }
          })
          return {
            id: team.id,
            users:team.users
          }
        })
        return {
          id: spotlight.id,
          teams:spotlight.teams
        }
      })

      let libre = await User.findAll({
        where: {
          teamId: null,
          plusOne: false
        }
      })

      libre = libre.map(user => {
        return{
          id: user.id,
          name: user.name,
          paid: user.paid
        }
      })

      return res
        .status(200)
        .json({ spotlights, libre })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
