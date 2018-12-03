
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('permission', {
    userId : { type: DataTypes.UUID, allowNull: false, unique: true },
    respo: { type: DataTypes.STRING, defaultValue: '' },
    admin: { type: DataTypes.BOOLEAN, defaultValue: false },
    permission: { type: DataTypes.STRING, defaultValue: '' },
  })
}