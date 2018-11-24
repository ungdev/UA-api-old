
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('permission', {
    userId : { type: DataTypes.UUID, allowNull: false, unique: true },
    respo: { type: DataTypes.STRING, defaultValue: null },
    admin: { type: DataTypes.INTEGER, defaultValue: null }
  })
}