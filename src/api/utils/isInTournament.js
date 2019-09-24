/* eslint-disable camelcase */
const moment = require('moment');
const { isTournamentFull, isTeamFull } = require('./isFull');

module.exports = async function isInSpotlight(teamId, req) {
  const { User, Team, Spotlight, Order } = req.app.locals.models;
  const team = await Team.findByPk(teamId, { include: [User] });
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
              attributes: ['paid', 'place', 'paid_at'],
            }],
          },
        ],
      },
    ],
  });

  // check for dumbass visitors that enters a team...
  team.users = team.users.filter((user) => !user.plusone && user.paid);
  if (team.soloTeam) return true; // cant join without having paid in solo tournament
  if (!team.users) return false; // no paid players in team
  if (team.users.length < spotlight.perTeam) return false; // not enough paid players in team

  // if spotlight isn't full, the team must be in the spotlight
  if (!isTournamentFull(spotlight)) return true;


  spotlight.teams = spotlight.teams.map((teamMap) => {
    let teamCompletedAt = '2000-01-01'; // initialize way in the past
    teamMap.users.forEach((user) => {
      const payment = user.orders.find((order) => order.place && order.paid);
      if (payment) {
        const { paid_at } = payment;
        if (moment(teamCompletedAt).isBefore(paid_at)) teamCompletedAt = paid_at;
        if (moment(teamCompletedAt).isBefore(user.joined_at)) teamCompletedAt = user.joined_at;
      }
    });
    // users is used in isTeamFull
    return {
      id: teamMap.id, name: teamMap.name, completed_at: teamCompletedAt, users: teamMap.users,
    };
  })
    .filter((teamFilter) => isTeamFull(teamFilter, spotlight.perTeam, true))
    .sort((team1, team2) => {
      if (moment(team1.completed_at).isAfter(team2.completed_at)) return 1;
      if (moment(team1.completed_at).isBefore(team2.completed_at)) return -1;
      return 0;
    });
  spotlight.teams = spotlight.teams.slice(0, (spotlight.maxPlayers / spotlight.perTeam));
  const found = spotlight.teams.find((t) => t.id === team.id);
  return !!found;
};