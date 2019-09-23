const { isTournamentFull, isTeamFull } = require('./isFull')
const moment = require('moment')

module.exports = async function isInSpotlight(teamId, req) {
  const { User, Team, Spotlight, Order } = req.app.locals.models
  let team = await Team.findByPk(teamId, { include:[User] })
  const spotlight = await Spotlight.findByPk(team.spotlightId, {
    include: [
      {
        model: Team,
        attributes: ['id', 'name'],
        include: [
          {
            model: User,
            attributes: ['joined_at', 'paid'],
            include: [{
              model: Order,
              attributes: ['paid', 'place', 'paid_at']
            }]
          }
        ]
      }
    ]
  })
  team.users = team.users.filter(user => !user.plusone && user.paid) // check for dumbass visitors that enters a team...
  if(team.soloTeam) return true // cant join without having paid in solo tournament
  if(!team.users) return false // no paid players in team
  if(team.users.length < spotlight.perTeam) return false //not enough paid players in team
  
  if(!isTournamentFull(spotlight)) return true //if spotlight isn't full, the team must be in the spotlight


  spotlight.teams = spotlight.teams.map(team => {
    let teamCompletedAt = '2000-01-01' // initialize way in the past
    team.users.forEach(user => {
      const payment = user.orders.find(order => order.place && order.paid)
      if(payment) {
        const paid_at = payment.paid_at
        if(moment(teamCompletedAt).isBefore(paid_at)) teamCompletedAt = paid_at
        if(moment(teamCompletedAt).isBefore(user.joined_at)) teamCompletedAt = user.joined_at
      }
    })
    return {id: team.id, name: team.name, completed_at: teamCompletedAt, users: team.users } //users is used in isTeamFull
  }).filter(team => isTeamFull(team, spotlight.perTeam, true)).sort((team1, team2) => {
    if(moment(team1.completed_at).isAfter(team2.completed_at)) return 1
    if(moment(team1.completed_at).isBefore(team2.completed_at)) return -1
    return 0
  })
  spotlight.teams = spotlight.teams.slice(0, (spotlight.maxPlayers / spotlight.perTeam))
  let found = spotlight.teams.find(t => t.id === team.id)
  return found ? true : false
}

