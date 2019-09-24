module.exports = (sequelize, DataTypes) => sequelize.define('team', {
  id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  toornamentId: { type: DataTypes.STRING },
});
