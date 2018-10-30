
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
    message: { type: DataTypes.STRING },
  })
}