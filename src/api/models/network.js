
module.exports = (sequelize, DataTypes) => sequelize.define('network', {
  id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  ip: { type: DataTypes.STRING, defaultValue: null },
  mac: { type: DataTypes.STRING, defaultValue: null },
  switchId: { type: DataTypes.INTEGER, defaultValue: null },
  switchPort: { type: DataTypes.INTEGER, defaultValue: null },
  isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  isCaster: { type: DataTypes.BOOLEAN, defaultValue: false },
});
