module.exports = (sequelize, DataTypes) => {
  return sequelize.define('cartItem', {
    id: {primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
    quantity: {type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1},
    attribute: {type: DataTypes.JSON},
    refunded: {type: DataTypes.BOOLEAN, defaultValue: false}
  })
}
