const isTeamPaid = require('./isTeamPaid');

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

const isTournamentFull = async (tournament, req) => {
  const maxTeams = tournament.maxPlayers / tournament.playersPerTeam;
  if (!tournament.teams) {
    return false;
  }
  let teams = await Promise.all(tournament.teams.map(async (team) => {
    let isPaid = true;
    isPaid = await isTeamPaid(req, team, null, tournament.playersPerTeam);
    return (isPaid ? 'paid' : 'empty');
  }));
  teams = teams.filter((team) => team !== 'empty');
  return teams.length >= maxTeams;
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

module.exports = { isTeamFull, isTournamentFull, remainingPlaces };
