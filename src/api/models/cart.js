module.exports = (sequelize, DataTypes) => {
  return sequelize.define('cart', {
    id: {primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
    paidAt: {type: DataTypes.STRING},
    refunded: {type: DataTypes.BOOLEAN, defaultValue: false},
    transactionId: {type: DataTypes.INTEGER},
    transactionState: {type: DataTypes.STRING},
  })
}
