module.exports = (sequelize, DataTypes) => {
  return sequelize.define('item', {
    name: {type: DataTypes.STRING, allowNull: false},
    key: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
    infos: {type: DataTypes.STRING},
    attributes: {type: DataTypes.JSON}
  })
}
