const isTeamFull = (team, max, paid = false) => {
  let count

  if (paid) {
    count = team.users.filter(user => user.paid).length
  } else {
    count = team.users.length
  }

  return count >= max
}

const isSpotlightFull = spotlight => {
  const maxTeams = spotlight.maxPlayers / spotlight.perTeam

  const teams = spotlight.teams.filter(team => team.spotlightId).length

  return teams >= maxTeams
}

module.exports = { isTeamFull, isSpotlightFull }
