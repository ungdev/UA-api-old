
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('conversations', {
    user1: { type: DataTypes.UUID },
    user2 : { type: DataTypes.UUID },
  })
}