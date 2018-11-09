const log = require('./log')(module)

const isTeamFull = (team, max, paid = false) => {
  let count
  if(!team.users){
    log.info('NO USERS IN TEAM')
    return false
  }

  if (paid) {
    count = team.users.filter(user => user.paid).length
  } else {
    count = team.users.length
  }

  return count >= max
}

const isSpotlightFull = spotlight => {
  const maxTeams = spotlight.maxPlayers / spotlight.perTeam
  if(!spotlight.teams) {
    log.info('TEAMS UNDEFINED IN SPOTLIGHT', spotlight.id)
    return false
  }
  let teams = spotlight.teams.filter(team => isTeamFull(team, spotlight.perTeam, true)).length
  return teams >= maxTeams
}

module.exports = { isTeamFull, isSpotlightFull }
