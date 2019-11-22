const { Op } = require('sequelize');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

const includePay = (cartItemModel, cartModel, userModel) => ({
  model: cartItemModel,
  as: 'forUser',
  attributes: ['id', 'itemId'],
  required: false,
  where: {
    [Op.or]: [
      { itemId: ITEM_PLAYER_ID },
      { itemId: ITEM_VISITOR_ID }
    ],
  },
  include: [{
    model: cartModel,
    as: 'cart',
    attributes: [],
    where: {
      transactionState: 'paid'
    },
  }, {
    model: userModel,
    as: 'userCart',
    attributes: ['email', 'username']
  }]
});

const includeCart = (cartModel, cartItemModel, itemModel, userModel) => ({
  model: cartModel,
  attributes: ['id', 'transactionId', 'paidAt', 'transactionState'],
  required: false,
  separate: true,
  include: [{
    model: cartItemModel,
    attributes: ['id','quantity', 'refunded'],
    include: [{
      model: itemModel,
      attributes: ['name']
    }, {
      model: userModel,
      as: 'forUser',
      attributes: ['email', 'username']
    }]
  }],
  order: [['paidAt', 'ASC']],
});

module.exports = { includeCart, includePay };