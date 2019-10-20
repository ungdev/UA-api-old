module.exports = (sequelize, DataTypes) => sequelize.define('item', {
  name: { type: DataTypes.STRING, allowNull: false },
  key: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: -1 },
  infos: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
});