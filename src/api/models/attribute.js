module.exports = (sequelize, DataTypes) => sequelize.define('attribute', {
  label: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
});
