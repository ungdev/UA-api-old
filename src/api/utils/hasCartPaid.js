const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

const hasCartPaid = async (user, cartModel, cartItemModel) => {
  const countCarts = await cartModel.count({
    where: {
      transactionState: 'paid',
    },
    include: [
      {
        model: cartItemModel,
        where: {
          itemId:
              user.type === 'visitor' ? ITEM_VISITOR_ID : ITEM_PLAYER_ID,
          forUserId: user.id,
        },
      },
    ],
  });
  return !!countCarts;
};

module.exports = hasCartPaid;