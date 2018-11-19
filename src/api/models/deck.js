
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('deck', {
    name: { type: DataTypes.STRING, defaultValue: null },
    class: { type: DataTypes.STRING, defaultValue: null },
    deckstring: { type: DataTypes.STRING, defaultValue: null },
  })
}
