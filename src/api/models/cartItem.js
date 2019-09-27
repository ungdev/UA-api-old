module.exports = (sequelize, DataTypes) => sequelize.define('cartItem', {
  id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  quantity: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
  refunded: { type: DataTypes.BOOLEAN, defaultValue: false },
});
