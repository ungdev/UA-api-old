module.exports = (sequelize, DataTypes) => {
  return sequelize.define('spotlight', {
    name: { type: DataTypes.STRING, unique: true },
    maxPlayers: { type: DataTypes.INTEGER },
    perTeam: { type: DataTypes.INTEGER, defaultValue: 5 }
  })
}
