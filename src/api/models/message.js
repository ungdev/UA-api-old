
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('message', {
    id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    message: { type: DataTypes.STRING, allowNull: false },
    fromAdmin: { type: DataTypes.BOOLEAN, allowNull: false }
  })
}
