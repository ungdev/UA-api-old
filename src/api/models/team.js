module.exports = (sequelize, DataTypes) => sequelize.define('team', {
  id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false },
  toornamentId: { type: DataTypes.STRING },
}, {
  indexes: [
    {
      unique: true,
      fields: ['name', 'tournamentId'],
    },
  ],
});
