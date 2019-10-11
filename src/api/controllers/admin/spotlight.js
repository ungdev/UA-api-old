const moment = require('moment');
const isAdmin = require('../../middlewares/isAdmin');
const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const { isTeamFull } = require('../../utils/isFull');
const { outputFields } = require('../../utils/publicFields');

/**
 * GET /admin/spotlight/:id
 *
 * Response:
 * [
 *    { id, completed_at, name, users }, ...
 * ]
 */
module.exports = (app) => {
  app.get('/admin/spotlight/:id', [isAuth(), isAdmin()]);

  app.get('/admin/spotlight/:id', async (req, res) => {
    const { Spotlight, Team, User, Order } = req.app.locals.models;

    try {
      const spotlight = await Spotlight.findByPk(req.params.id, {
        include: [{
          model: Team,
          include: [{
            model: User,
            include: [Order],
          }],
        }],
      });

      spotlight.teams = spotlight.teams.map((team) => {
        let teamCompletedAt = moment('2000-01-01'); // initialize way in the past

        team.users = team.users.map((user) => {
          const place = user.orders.find((order) => order.paid && order.place);
          const paid_at = place ? place.paid_at : '';

          if (moment(teamCompletedAt).isBefore(paid_at)) {
            teamCompletedAt = paid_at;
          }

          if (moment(teamCompletedAt).isBefore(user.joined_at)) {
            teamCompletedAt = user.joined_at;
          }

          return outputFields(user);
        });

        return { id: team.id, captainId: team.captainId, completed_at: teamCompletedAt, name: team.name, users: team.users };
      })
        .sort((team1, team2) => moment(team1.completed_at).isAfter(team2.completed_at))
        .filter((team) => isTeamFull(team, spotlight.perTeam, true));

      return res
        .status(200)
        .json(spotlight.teams)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
