module.exports = (sequelize, DataTypes) => sequelize.define('tournament', {
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  shortName: { type: DataTypes.STRING, allowNull: false },
  maxPlayers: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  playersPerTeam: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  toornamentId: { type: DataTypes.STRING },
});
