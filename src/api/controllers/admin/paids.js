/* eslint-disable max-len */

const isAdmin = require('../../middlewares/isAdmin');
const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const { isTeamFull } = require('../../utils/isFull');

/**
 * GET /admin/paids
 *
 * Response:
 *  { totalUsers, totalPaidPlayers, totalPaidVisitors, totalUnpaid, totalTeams, totalPaidTeams, totalFullTeams, totalFreePlayers }
 */
module.exports = (app) => {
  app.get('/admin/paids', [isAuth(), isAdmin()]);

  app.get('/admin/paids', async (req, res) => {
    const { User, Team, Spotlight, Order } = req.app.locals.models;

    try {
      const totalUsers = await User.count();

      const totalPaidVisitors = await Order.count({
        where: { paid: 1, place: 1, plusone: 1 },
      });

      const totalUnpaid = await User.count({
        where: { paid: 0 },
      });

      const totalFreePlayers = await User.count({
        where: { paid: 1, plusone: 0, teamId: null },
      });
      const totalPaidPlayers = await User.findAll({
        where: {
          paid: 1,
          plusone: 0,
        },
        attributes: ['id'],
        include: [
          {
            model: Team,
            attributes: ['id'],
            include: [
              {
                model: Spotlight,
                attributes: ['id'],
              },
            ],
          },
        ],
      });
      const totalLolProPlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 1).length;
      const totalLolAmateurPlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 2).length;
      const totalFortnitePlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 3).length;
      const totalCSGOPlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 4).length;
      const totalHSPlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 5).length;
      const totalSSBUPlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 6).length;
      const totalOSUPlayers = totalPaidPlayers.filter((player) => player.team && player.team.spotlight && player.team.spotlight.id === 7).length;

      const totalTeams = await Team.count();
      const teams = await Team.findAll({ include: [Spotlight, User] });
      const totalPaidTeams = teams.filter((team) => isTeamFull(team, team.spotlight.perTeam, true) && team.spotlight.perTeam > 1).length;
      const totalFullTeams = teams.filter((team) => isTeamFull(team, team.spotlight.perTeam, false) && team.spotlight.perTeam > 1).length;
      return res
        .status(200)
        .json({
          totalUsers,
          totalPaidPlayers: totalPaidPlayers.length,
          totalPaidVisitors,
          totalUnpaid,
          totalTeams,
          totalPaidTeams,
          totalFullTeams,
          totalFreePlayers,
          totalLolProPlayers,
          totalLolAmateurPlayers,
          totalFortnitePlayers,
          totalCSGOPlayers,
          totalHSPlayers,
          totalSSBUPlayers,
          totalOSUPlayers,
        })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
