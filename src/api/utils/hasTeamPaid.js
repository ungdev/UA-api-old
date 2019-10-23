const { Op } = require('sequelize');

const ITEM_PLAYER_ID = 1;

module.exports = async function hasTeamPaid(req, team, tournaments, playersPerTeam) {
  const { Cart, CartItem } = req.app.locals.models;
  const sizeTeam = playersPerTeam || tournaments[team.tournamentId - 1].playersPerTeam;
  const totalUsersId = team.users.map(({ id }) => id);

  if (sizeTeam > totalUsersId.length) {
    return false;
  }

  const totalPaid = await CartItem.count({
    where: {
      forUserId: {
        [Op.in]: totalUsersId,
      },
      itemId: ITEM_PLAYER_ID,
    },
    include: [{
      model: Cart,
      where: {
        transactionState: {
          [Op.in]: ['paid', 'draft'],
        },
      },
    }],
  });

  if (totalPaid === sizeTeam) {
    return true;
  }
  return false;
};