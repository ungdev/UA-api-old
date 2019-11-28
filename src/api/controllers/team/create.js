const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');
const { isTournamentFull } = require('../../utils/isFull');
const log = require('../../utils/log.js')(module);

const CheckCreate = [
  check('teamName').isLength({ min: 3, max: 40 }),
  check('tournament').isInt(),
  validateBody(),
];

/**
 * Create a team
 *
 * POST /team
 * {
 *    teamName: String
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 *
 * @param {object} tournamentModel
 * @param {object} teamModel
 * @param {object} userModel
 */
const Create = (tournamentModel, teamModel, userModel, cartItemModel, cartModel) => async (req, res) => {
  try {
    const [tournamentFull, tournament] = await isTournamentFull(req.body.tournament, userModel, teamModel, tournamentModel, cartItemModel, cartModel);
    if (tournamentFull) {
      return res
        .status(400)
        .json({ error: 'TOURNAMENT_FULL' })
        .end();
    }

    const team = await teamModel.create({
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

    log.info(
      `user ${req.user.username} created team ${req.body.teamName}`,
    );

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
};

module.exports = { Create, CheckCreate };
