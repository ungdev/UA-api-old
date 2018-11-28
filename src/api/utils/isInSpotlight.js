const { isSpotlightFull, isTeamFull } = require('./isFull')
const moment = require('moment')

module.exports = async function isInSpotlight(teamId, req) {
  const { User, Team, Spotlight, Order } = req.app.locals.models
  let team = await Team.findById(teamId, { include:[User] })
  const spotlight = await Spotlight.findById(team.spotlightId, {
    include: [
      {
        model: Team,
        include: [
          {
            model: User,
            include: [Order]
          }
        ]
      }
    ]
  })
  team.users = teams.users.filter(user => user.plusone === 0) // check for dumbass visitors that enters a team...
  if(team.soloTeam) return true // cant join without having paid in solo tournament
  if(!team.users) return false // no players in team (should not happened)
  if(team.users.length < spotlight.perTeam) return false //not enough players in team
  
  const unpaidUser = team.users.find(user => !user.paid)
  if(unpaidUser) return false
  if(!isSpotlightFull(spotlight)) return true //if spotlight isn't full, the team must be in the spotlight


  spotlight.teams = spotlight.teams.map(team => {
    let teamCompletedAt = moment('2000-01-01') // initialize way in the past
    team.users.forEach(user => {
      const payment = user.orders.find(order => order.place && order.paid)
      if(payment) {
        const paid_at = payment.paid_at
        if(moment(teamCompletedAt).isBefore(paid_at)) teamCompletedAt = paid_at
        if(moment(teamCompletedAt).isBefore(user.joined_at)) teamCompletedAt = user.joined_at
      }
    })
    return {id: team.id, completed_at: teamCompletedAt, users: team.users } //users is used in isTeamFull
  }).sort((team1, team2) => moment(team1.completed_at).isAfter(team2.completed_at))

  spotlight.teams = spotlight.teams.filter(team => isTeamFull(team, spotlight.perTeam, true))
                                   .slice(0, (spotlight.maxPlayers / spotlight.perTeam))

  let found = spotlight.teams.find(t => t.id === team.id)
  return found ? true : false
}

