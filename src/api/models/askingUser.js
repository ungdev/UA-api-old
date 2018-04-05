module.exports = (sequelize, DataTypes) => {
  return sequelize.define('askingUser', {
    message: { type: DataTypes.STRING, defaultValue: '' }
  })
}
