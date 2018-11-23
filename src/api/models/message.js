
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('message', {
    message: { type: DataTypes.STRING },
  })
}