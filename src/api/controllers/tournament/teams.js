const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const isInTournament = require('../../utils/isInTournament');
const { outputFields } = require('../../utils/publicFields');


/**
 * GET /user
 *
 * Response:
 * {
 *    user: User
 *    token: String,
 *    spotlights: [Spotlight]
 *    teams: [Team]
 *    teamfinders: [Teamfinder],
 *    prices: Object
 * }
 */
module.exports = (app) => {
  app.get('/spotlights/:id/teams', [isAuth()]);

  app.get('/spotlights/:id/teams', async (req, res) => {
    const { Team, User, AskingUser } = req.app.locals.models;

    try {
      let teams = await Team.findAll({
        where: { spotlightId: req.params.id },
        include: [
          {
            model: User,
          },
          {
            model: User,
            through: AskingUser,
            as: 'AskingUser',
          },
        ],
      });
      if (!teams) return res.status(404).json('SPOTLIGHT_NOT_FOUND').end();
      teams = await Promise.all(teams.map(async (team) => {
        team = team.toJSON();
        if (team.AskingUser) {
          team.askingUsers = team.AskingUser.map((teamUser) => {
            // clean the user
            const cleanedUser = outputFields(teamUser);

            // add data from join table
            cleanedUser.askingMessage = teamUser.askingUser.message;

            return cleanedUser;
          });

          delete team.AskingUser;
        }
        team.isInSpotlight = await isInTournament(team.id, req);

        let isRespo = false;

        if (req.user && req.user.permission) {
          if (req.user.permission.admin) {
            isRespo = true;
          }
          else if (req.user.permission.respo && req.user.permission.respo.includes(req.params.id)) {
            isRespo = true;
          }
        }

        return {
          ...team,
          users: team.users.map((user) => ({
            id: user.id,
            name: user.name,
            role: user.role,
            // If respo, returns the user's place otherwise, nothing. If he isn't placed, returns /
            // eslint-disable-next-line no-nested-ternary
            place: isRespo ? (user.tableLetter != null ? user.tableLetter + user.placeNumber : '/') : '',
          })),
        };
      }));
      return res
        .status(200)
        .json(teams)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
