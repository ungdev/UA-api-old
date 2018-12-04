module.exports = (sequelize, DataTypes) => {
  return sequelize.define('team', {
    name: { type: DataTypes.STRING, unique: true },
    captainId: { type: DataTypes.UUID },
    soloTeam: { type: DataTypes.BOOLEAN, defaultValue: false },
    toornamentID: { type: DataTypes.STRING }
  })
}
