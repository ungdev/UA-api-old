const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log.js')(module);

/**
 * Make a request to join a specified team
 * POST /teams/:id/request
 *
 * Response:
 * {}
 *
 * @param {string} teamIdString team id name in the route parameter
 * @param {object}  teamModel team model to query
 * @param {object}  userModel user model to query
 * @param {object}  tournamentModel tournament model to query
 */
const Request = (teamIdString, teamModel, userModel, tournamentModel) => async (req, res) => {
  const teamId = req.params[teamIdString];
  if (req.user.teamId !== null) {
    log.warn(
      `user ${req.user.name} tried to join team while he already has one`,
    );

    return res
      .status(400)
      .json({ error: 'ALREADY_IN_TEAM' })
      .end();
  }

  try {
    const team = await teamModel.findByPk(teamId, {
      include: [
        {
          model: userModel,
          attributes: ['id'],
        },
        {
          model: tournamentModel,
          attributes: ['playersPerTeam'],
        },
      ],
    });
    if (team.tournament.playersPerTeam === team.users.length) {
      return res
        .status(400)
        .json({ error: 'TEAM_FULL' })
        .end();
    }

    req.user.askingTeamId = teamId;
    await req.user.save();

    log.info(`user ${req.user.username} asked to join team ${teamId}`);

    return res.status(204).end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = Request;
