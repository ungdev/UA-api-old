const env = require('../../env')

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, unique: true },
    lastname: { type: DataTypes.STRING },
    firstname: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true }, unique: true },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    password: { type: DataTypes.STRING },
    barcode: { type: DataTypes.STRING },
    paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paid_at: { type: DataTypes.STRING, defaultValue: null }, //to remove
    joined_at: { type: DataTypes.STRING, defaultValue: null },
    shirt: { type: DataTypes.STRING, defaultValue: 'none' }, //to remove
    plusone: { type: DataTypes.BOOLEAN, defaultValue: false },
    ethernet: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    ethernet7: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    kaliento: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    mouse: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    keyboard: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    headset: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    screen24: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    screen27: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    chair: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    gamingPC: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    streamingPC: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    laptop: { type: DataTypes.BOOLEAN, defaultValue: false }, //to remove
    tombola: { type: DataTypes.INTEGER, defaultValue: 0 }, //to remove
    transactionId: { type: DataTypes.INTEGER, defaultValue: 0 }, //to remove
    transactionState: { type: DataTypes.STRING }, //to remove
    registerToken: { type: DataTypes.STRING },
    resetToken: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    respo: { type: DataTypes.INTEGER, defaultValue: 0 },
  })
}
