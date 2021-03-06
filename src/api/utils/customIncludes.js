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
      { itemId: ITEM_VISITOR_ID },
    ],
  },
  include: [{
    model: cartModel,
    as: 'cart',
    attributes: [],
    where: {
      transactionState: 'paid',
    },
  }, {
    model: userModel,
    as: 'userCart',
    attributes: ['email', 'username'],
  }],
});

const includeCart = (cartModel, cartItemModel, itemModel, userModel, attributeModel) => ({
  model: cartModel,
  attributes: ['id', 'transactionId', 'paidAt', 'transactionState'],
  required: false,
  separate: true,
  include: [{
    model: cartItemModel,
    attributes: ['id', 'quantity'],
    include: [{
      model: itemModel,
      attributes: ['id', 'name', 'price'],
    }, {
      model: userModel,
      as: 'forUser',
      attributes: ['email', 'username'],
    }, {
      model: attributeModel,
      attributes: ['label'],
    }],
  }],
  where: {
    transactionState: { [Op.ne]: 'draft' },
  },
  order: [['paidAt', 'ASC']],
});

module.exports = { includeCart, includePay };