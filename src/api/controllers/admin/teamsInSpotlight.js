const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const { isTeamFull } = require('../../utils/isFull')
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
  app.get('/admin/spotlight/:id', [isAuth(), isAdmin()])
  app.get('/admin/spotlight/:id', async (req, res) => {
    const { Spotlight, Team, User } = req.app.locals.models

    try {
      let spotlight = await Spotlight.findById(req.params.id, {
        include: [
          {
            model: Team,
            include: [User]
          }
        ]
      })

      spotlight.teams = spotlight.teams.map(team => {
        let teamCompletedAt = moment('2000') // initialize way in the past
        team.users.forEach(user => {
          if(moment(teamCompletedAt).isBefore(user.paid_at)) teamCompletedAt = user.paid_at
          if(moment(teamCompletedAt).isBefore(user.joined_at)) teamCompletedAt = user.joined_at
        })
        return {id: team.id, completed_at: teamCompletedAt, name: team.name, users: team.users}
      }).sort((team1, team2) => moment(team1.completed_at).isAfter(team2.completed_at))
      .filter(team => isTeamFull(team, spotlight.perTeam, true))

      return res
        .status(200)
        .json(spotlight.teams)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}