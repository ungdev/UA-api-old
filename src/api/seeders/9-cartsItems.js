/* eslint-disable no-unused-vars */

const uuid = require('uuid');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let cartItems = [{
      itemId: 1,
      forUserId: '48fe6584-a118-4f85-8b6a-a2f26a1538b1',
    }, {
      itemId: 1,
      forUserId: '48fe6584-a118-4f85-8b6a-a2f26a1538b2',
    }, {
      itemId: 7,
      attributeId: 2,
      forUserId: '48fe6584-a118-4f85-8b6a-a2f26a1538b1',
    }];

    cartItems = cartItems.map((cartItem) => ({
      ...cartItem,
      id: uuid(),
      cartId: 'bb1572b9-743a-4beb-a525-8ea5017a9952',
      userId: '48fe6584-a118-4f85-8b6a-a2f26a1538b1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('cartItems', cartItems);
  },
};
