const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log.js')(module);

const CheckAddUser = [check('user').isUUID(), validateBody()];
/**
 * Add a user to a specified team
 *
 * POST /teams/:id/users
 * {
 *   user: UUID
 * }
 *
 * Response:
 * {
 *
 * }
 * @param {string} teamIdString the team id name to look for in the route parameters
 * @param {object} userModel the user model to query
 * @param {object} teamModel the team model to query
 * @param {object} tournamentModel the tournament model to query
 *
 */
const AddUser = (teamIdString, userModel, teamModel, tournamentModel) => async (req, res) => {
  try {
    const team = await teamModel.findByPk(req.params[teamIdString], {
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
    const user = await userModel.findByPk(req.body.user, {
      where: {
        askingTeamId: team.id,
      },
    });

    if (team && team.users.length === team.tournament.playersPerTeam) {
      return res
        .status(400)
        .json({ error: 'TEAM_FULL' })
        .end();
    }
    if (user) {
      user.teamId = team.id;
      user.askingTeamId = null;
      user.type = 'player';
      await user.save();

      log.info(
        `user ${req.user.username} accepted user ${user.username}`,
      );

      return res.status(200).end();
    }
    return res
      .status(404)
      .json({ error: 'NOT_ASKING_USER' })
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { AddUser, CheckAddUser };
