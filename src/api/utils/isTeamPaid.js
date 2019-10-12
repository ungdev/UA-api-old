const ITEM_PLAYER_ID = 1;

module.exports = async function isTeamPaid(req, team, tournaments, playersPerTeam) {
  const { Cart, CartItem } = req.app.locals.models;
  const sizeTeam = playersPerTeam || tournaments[team.tournamentId - 1].playersPerTeam;
  const totalUsers = team.users;
  if (sizeTeam > totalUsers.length) {
    return false;
  }
  const teamPaid = await Promise.all(totalUsers.map(async (user) => {
    const hasCartPaid = await Cart.count({
      where: {
        transactionState: 'paid',
      },
      include: [{
        model: CartItem,
        where: {
          itemId: ITEM_PLAYER_ID,
          forUserId: user.id,
        },
      }],
    });
    const isPaid = !!hasCartPaid;
    return isPaid;
  }));
  const totalPaid = teamPaid.filter((paid) => paid === true);
  if (totalPaid.length === sizeTeam) {
    return true;
  }
  return false;
};