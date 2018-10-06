const { isSpotlightFull, isTeamFull } = require('./isFull')
const moment = require('moment')

module.exports = async function isInSpotlight(teamId, req) {
  const { User, Team, Spotlight } = req.app.locals.models
  let team = await Team.findById(teamId, { include:[User] })
  const spotlight = await Spotlight.findById(team.spotlightId, {
    include: [
      {
        model: Team,
        include: [User]
      }
    ]
  })
  if(team.soloTeam) return true // cant join without having paid in solo tournament
  if(!team.users) return false // no players in team (should not happened)
  if(team.users.length < spotlight.perTeam) return false //not enough players in team
  
  const unpaidUser = team.users.find(user => !user.paid)
  if(unpaidUser) return false
  if(!isSpotlightFull(spotlight))return true //if spotlight isn't full, the team must be in the spotlight


  spotlight.teams = spotlight.teams.map(team => {
    let teamCompletedAt = moment('2000') // initialize way in the past
    team.users.forEach(user => {
      if(moment(teamCompletedAt).isBefore(user.paid_at)) teamCompletedAt = user.paid_at
      if(moment(teamCompletedAt).isBefore(user.joined_at)) teamCompletedAt = user.joined_at
    })
    return {id: team.id, completed_at: teamCompletedAt, users: team.users}
  }).sort((team1, team2) => moment(team1.completed_at).isAfter(team2.completed_at))

  spotlight.teams = spotlight.teams.filter(team => isTeamFull(team, spotlight.perTeam, true))
                                   .slice(0, (spotlight.maxPlayers / spotlight.perTeam))

  let found = spotlight.teams.find(t => t.id === team.id)
  return found ? true : false
}

