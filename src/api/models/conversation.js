
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('conversation', {
    user1: { type: DataTypes.UUID },
    user2 : { type: DataTypes.UUID },
    spotlightId: { type: DataTypes.INTEGER }
  })
}