/* eslint-disable no-unused-vars */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('carts', [{
    id: 'bb1572b9-743a-4beb-a525-8ea5017a9952',
    userId: '48fe6584-a118-4f85-8b6a-a2f26a1538b1', // user
    transactionState: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }]),
};
