
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('info', {
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.STRING },
    deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    spotlightId: { type: DataTypes.INTEGER }
  })
}
