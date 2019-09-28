const Sequelize = require('sequelize');

const ticketId = 1;

module.exports = async function isTeamPaid(req, team, tournaments, playersPerTeam) {
  const { Cart, CartItem } = req.app.locals.models;
  const cartItemTickets = await CartItem.findAll({
    where: {
      itemId: ticketId,
      forUserId: {
        [Sequelize.Op.in]: team.users.map((user) => user.id),
      },
    },
  });
  const cartsUnpayed = await Cart.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: cartItemTickets.map((cartItem) => cartItem.cartId),
      },
      transactionState: {
        [Sequelize.Op.notIn]: ['paid'],
      },
    },
  });
  const sizeTeam = playersPerTeam || tournaments[team.tournamentId - 1].playersPerTeam;
  if (cartItemTickets.length === sizeTeam && cartsUnpayed.length === 0) {
    return true;
  }
  return false;
};