const errorHandler = require('../../utils/errorHandler');

/**
 * Get all the tournaments
 *
 * GET /tournaments
 *
 * Params: {
 *  paidOnly: bool. Return paid teams only
 *  notFull: bool. Don't return full teams
 * }
 *
 * Response:
 * [
 *   [Tournament]
 * ]
 *
 * @param {object} tournamentModel
 * @param {object} teamModel
 * @param {object} userModel
 */
const List = (tournamentModel, teamModel, userModel, cartItemModel, cartModel) => async (req, res) => {
  try {
    const includeCart = {
      model: cartItemModel,
      as: 'forUser',
      attributes: [],
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

    const tournaments = await tournamentModel.findAll({
      include: [
        {
          model: teamModel,
          include: {
            model: userModel,
            attributes: ['username', 'id'],
            ...(req.query.paidOnly && {
              include: [includeCart],
            }),
          },
        },
      ],
      order: [['id', 'ASC']],
    });

    const formatTournaments = tournaments.map((tournament) => {
      if (req.query.notFull) {
        return {
          ...tournament.toJSON(),
          teams: tournament.teams.filter((team) => team.users.length < tournament.playersPerTeam),
        };
      }
      return {
        ...tournament.toJSON(),
        teams: tournament.teams.filter((team) => team.users.length === tournament.playersPerTeam),
      };
    });

    return res
      .status(200)
      .json(formatTournaments)
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = List;
