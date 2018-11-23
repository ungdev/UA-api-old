const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const isInSpotlight = require('../../utils/isInSpotlight')

/**
 * GET /admin/teams
 *
 * Response:
 * [
 *    { id, name, isInSpotlight, spotlightId, users }, ...
 * ]
 */
module.exports = app => {
  app.get('/admin/teams', [isAuth(), isAdmin()])

  app.get('/admin/teams', async (req, res) => {
    const { User, Team } = req.app.locals.models

    try {
      let teams = await Team.findAll({
        include: [User]
      })

      teams = await Promise.all(teams.map(async team => {
        let users = team.users.map(user => {
          return { id: user.id, paid: user.paid }
        })

        return {
          id : team.id,
          name: team.name,
          isInSpotlight: await isInSpotlight(team.id, req),
          spotlightId: team.spotlightId,
          users
        }
      }))
      
      return res
        .status(200)
        .json(teams)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
