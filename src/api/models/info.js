module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'info',
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.STRING },
    },
    { paranoid: true }
  );
