module.exports = (sequelize) => {
  let itemshasattributes = [];

  for (let attributeId = 2; attributeId <= 5; attributeId += 1) {
    itemshasattributes.push({ attributeId, itemId: 6 }, { attributeId, itemId: 7 });
  }

  itemshasattributes = itemshasattributes.map((itemattribute) => ({
    ...itemattribute,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return sequelize.queryInterface.bulkInsert('itemshasattributes', itemshasattributes);
};