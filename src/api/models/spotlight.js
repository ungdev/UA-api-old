module.exports = (sequelize, DataTypes) => {
  return sequelize.define('spotlight', {
    name: { type: DataTypes.STRING, unique: true },
    shortName: { type: DataTypes.STRING },
    maxPlayers: { type: DataTypes.INTEGER },
    perTeam: { type: DataTypes.INTEGER, defaultValue: 5 },
    state: { type: DataTypes.INTEGER, defaultValue: 0 },
    toornamentID: { type: DataTypes.STRING }
  })
}
