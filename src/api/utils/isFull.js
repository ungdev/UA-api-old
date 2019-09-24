const isTeamFull = (team, max, paid = false) => {
  let count;
  if (!team.users) {
    return false;
  }

  if (paid) {
    count = team.users.filter((user) => user.paid).length;
  }
  else {
    count = team.users.length;
  }

  return count >= max;
};

const isSpotlightFull = (spotlight) => {
  const maxTeams = spotlight.maxPlayers / spotlight.perTeam;
  if (!spotlight.teams) {
    return false;
  }
  const teams = spotlight.teams.filter((team) => isTeamFull(team, spotlight.perTeam, true)).length;
  return teams >= maxTeams;
};

const remainingPlaces = (spotlight) => {
  const maxTeams = spotlight.maxPlayers / spotlight.perTeam;
  if (!spotlight.teams) {
    return false;
  }
  const teams = spotlight.teams.filter((team) => isTeamFull(team, spotlight.perTeam, true)).length;

  const remaining = maxTeams - teams;

  return remaining <= 5 && remaining > 0 ? remaining : '/';
};

module.exports = { isTeamFull, isTournamentFull: isSpotlightFull, remainingPlaces };
