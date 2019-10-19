/* eslint-disable no-unused-vars */

module.exports = {
  up: (queryInterface, Sequelize) => {
    let itemshasattributes = [];

    for (let attributeId = 2; attributeId <= 5; attributeId += 1) {
      itemshasattributes.push({ attributeId, itemId: 6 }, { attributeId, itemId: 7 });
    }

    itemshasattributes = itemshasattributes.map((itemattribute) => ({
      ...itemattribute,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('itemshasattributes', itemshasattributes);
  },
};
