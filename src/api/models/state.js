module.exports = (sequelize, DataTypes) => sequelize.define('state', {
  id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  index: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING },
  popover: { type: DataTypes.STRING },
});
