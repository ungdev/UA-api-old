const errorHandler = require('../../utils/errorHandler');
const hasTeamPaid = require('../../utils/hasTeamPaid.js');

/**
 * Get all the teams that have join the current tournament
 *
 * GET /tournaments/:id/teams
 *
 * Params: {
 *  onlyPaid: true Display only full team paid,
 *  notFull: true Display not full team,
 * }
 *
 * Response:
 * [
 *  [Team]
 * ]
 * @param {object} teamModel
 * @param {object} userModel
 * @param {object} tournamentModel
 */

const GetTeamsFromTournaments = (
  teamModel,
  userModel,
  tournamentModel,
) => async (req, res) => {
  try {
    let teams = await teamModel.findAll({
      where: {
        tournamentId: req.params.tournamentId,
      },
      include: [
        {
          model: userModel,
          attributes: ['id', 'username', 'firstname', 'lastname'],
        },
        {
          model: tournamentModel,
          attributes: ['playersPerTeam'],
        },
      ],
    });
    teams = await Promise.all(
      teams.map(async (team) => {
        const teamFormat = {
          ...team.toJSON(),
          users: team.users.map(({ username, firstname, lastname }) => ({
            username,
            firstname,
            lastname,
          })),
          tournament: undefined,
        };
        if (req.query.paidOnly === 'true') {
          const isPaid = await hasTeamPaid(
            req,
            team,
            null,
            team.tournament.playersPerTeam,
          );
          return isPaid ? teamFormat : 'empty';
        }
        if (req.query.notFull === 'true') {
          const notFull = team.users.length < team.tournament.playersPerTeam;
          return notFull ? teamFormat : 'empty';
        }
        return teamFormat;
      }),
    );
    teams = teams.filter((team) => team !== 'empty');
    return res
      .status(200)
      .json(teams)
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};
module.exports = GetTeamsFromTournaments;
