const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isNotInTeam = require('../../middlewares/isNotInTeam');
const errorHandler = require('../../utils/errorHandler');
const { isTournamentFull } = require('../../utils/isFull');
const log = require('../../utils/log')(module);

/**
 * POST /team
 * {
 *    teamName: String
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 */
module.exports = (app) => {
  app.post('/teams', [isAuth(), isNotInTeam()]);

  app.post('/teams', [
    check('teamName')
      .isLength({ min: 3, max: 40 }),
    check('tournament')
      .isInt(),
    validateBody(),
  ]);

  app.post('/teams', async (req, res) => {
    const { Tournament, Team, User } = req.app.locals.models;

    try {
      const tournament = await Tournament.findByPk(req.body.tournament, {
        include: [
          {
            model: Team,
            include: [User],
          },
        ],
      });
      const tournamentFull = await isTournamentFull(tournament, req);
      if (tournamentFull) {
        return res
          .status(400)
          .json({ error: 'TOURNAMENT_FULL' })
          .end();
      }

      const team = await Team.create({
        name: req.body.teamName,
        tournamentId: req.body.tournament,
      });
      await team.addUser(req.user);
      await team.setCaptain(req.user);
      req.user.askingTeamId = null;
      req.user.type = 'player';
      await req.user.save();
      const outputUser = {
        id: req.user.id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        username: req.user.username,
        email: req.user.email,
      };

      log.info(`user ${req.user.username} created team ${req.body.teamName}`);

      return res
        .status(200)
        .json({
          ...team.toJSON(),
          tournament: tournament.toJSON(),
          users: [outputUser],
          askingUsers: [],
        })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
