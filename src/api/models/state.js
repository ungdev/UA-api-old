module.exports = (sequelize, DataTypes) => {
  return sequelize.define('state', {
    title: { type: DataTypes.STRING },
    desc: { type: DataTypes.STRING },
    popover: { type: DataTypes.STRING },
  })
}
