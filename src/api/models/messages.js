
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
    from: { type: DataTypes.UUID },
    to: { type: DataTypes.UUID, defaultValue: null },
    message: { type: DataTypes.STRING },
  })
}