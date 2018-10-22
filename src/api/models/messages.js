
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
    from: { type: DataTypes.UUID },
    contotent: { type: DataTypes.UUID, defaultValue: null },
    message: { type: DataTypes.STRING },
  })
}