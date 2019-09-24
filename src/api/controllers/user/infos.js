const jwt = require('jsonwebtoken');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const { outputFields } = require('../../utils/publicFields');
const { isTournamentFull, remainingPlaces } = require('../../utils/isFull');
const isInTournament = require('../../utils/isInTournament');

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
  app.get('/user', [isAuth()]);

  app.get('/user', async (req, res) => {
    const { User, Tournament, Team } = req.app.locals.models;

    try {
      let tournaments = await Tournament.findAll({
        include: [{
          model: Team,
          include: [User],
        }],
      });

      // Generate new token
      const token = jwt.sign({ id: req.user.id }, process.env.ARENA_API_SECRET, {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      });

      const user = req.user.toJSON();


      tournaments = tournaments.map((tournament) => {
        tournament = tournament.toJSON();

        tournament.isFull = isTournamentFull(tournament);
        tournament.remainingPlaces = remainingPlaces(tournament);

        return tournament;
      });

      // Clean user team
      if (user.team && user.team.users.length > 0) {
        user.team.users = user.team.users.map(outputFields);
        user.team.isInTournament = await isInTournament(user.team.id, req);
        user.team.remainingPlaces = tournaments
          .find((tournament) => tournament.id === user.team.tournament.id).remainingPlaces;
      }

      // Select returned information about user
      const userData = {
        ...outputFields(user),
        team: user.team,
      };

      // todo: reajouter has changed ip

      return res
        .status(200)
        .json({
          user: userData,
          token,
          tournaments,
          // hasChangedIp
        })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
