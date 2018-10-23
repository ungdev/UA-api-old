
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('order', {
    paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paid_at: { type: DataTypes.STRING, defaultValue: null },
    transactionId: { type: DataTypes.INTEGER, defaultValue: 0 },
    transactionState: { type: DataTypes.STRING },
    place: { type: DataTypes.BOOLEAN, defaultValue: false },
    shirt: { type: DataTypes.STRING, defaultValue: 'none' },
    plusone: { type: DataTypes.BOOLEAN, defaultValue: false },
    ethernet: { type: DataTypes.BOOLEAN, defaultValue: false },
    ethernet7: { type: DataTypes.BOOLEAN, defaultValue: false },
    kaliento: { type: DataTypes.BOOLEAN, defaultValue: false },
    mouse: { type: DataTypes.BOOLEAN, defaultValue: false },
    keyboard: { type: DataTypes.BOOLEAN, defaultValue: false },
    headset: { type: DataTypes.BOOLEAN, defaultValue: false },
    screen24: { type: DataTypes.BOOLEAN, defaultValue: false },
    screen27: { type: DataTypes.BOOLEAN, defaultValue: false },
    chair: { type: DataTypes.BOOLEAN, defaultValue: false },
    gamingPC: { type: DataTypes.BOOLEAN, defaultValue: false },
    streamingPC: { type: DataTypes.BOOLEAN, defaultValue: false },
    laptop: { type: DataTypes.BOOLEAN, defaultValue: false },
    tombola: { type: DataTypes.INTEGER, defaultValue: 0 },
  })
}
