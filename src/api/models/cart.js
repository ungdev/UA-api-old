module.exports = (sequelize, DataTypes) => sequelize.define('cart', {
  id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  paidAt: { type: DataTypes.DATE },
  transactionId: { type: DataTypes.INTEGER },
  transactionState: { type: DataTypes.ENUM('draft', 'paid', 'refunded', 'canceled', 'refused'), allowNull: false, defaultValue: 'draft' },
});
