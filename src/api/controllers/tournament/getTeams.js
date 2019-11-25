const errorHandler = require('../../utils/errorHandler');

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
  cartItemModel,
  cartModel
) => async (req, res) => {
  try {
    const includeCart = {
      model: cartItemModel,
      as: 'forUser',
      required: false,
      attributes: ['id'],
      where: {
        itemId: 1,
      },
      include: [
        {
          model: cartModel,
          as: 'cart',
          attributes: [],
          where: {
            transactionState: 'paid',
          },
        },
      ],
    };
    let teams = await teamModel.findAll({
      where: {
        tournamentId: req.params.tournamentId,
      },
      include: [
        {
          model: userModel,
          attributes: ['username', 'firstname', 'lastname'],
          include: [includeCart],
        },
        {
          model: tournamentModel,
          attributes: ['playersPerTeam'],
        },
      ],
    });

    if (req.query.paidOnly) {
      teams = teams.filter((team) => {
        const usersPaid = team.users.filter((user) => user.forUser.length);
        return usersPaid.length === team.tournament.playersPerTeam;
      });
    }
    else if (req.query.notFull) {
      teams = teams.filter((team) => {
        const usersNotPaid = team.users.filter((user) => user.forUser.length === 0);
        return (
          usersNotPaid.length < team.tournament.playersPerTeam &&
          team.users.length < team.tournament.playersPerTeam
        );
      });
    }
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
