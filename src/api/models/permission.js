
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('permission', {
    respo: { type: DataTypes.INTEGER, defaultValue: 0 },
    sendMessage: { type: DataTypes.STRING, defaultValue: null },
  })
}
