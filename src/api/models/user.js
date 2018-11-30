module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, unique: true },
    lastname: { type: DataTypes.STRING },
    firstname: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true }, unique: true },
    password: { type: DataTypes.STRING },
    barcode: { type: DataTypes.STRING },
    paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    joined_at: { type: DataTypes.STRING, defaultValue: null },
    plusone: { type: DataTypes.BOOLEAN, defaultValue: false },
    registerToken: { type: DataTypes.STRING },
    resetToken: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    tableLetter: { type: DataTypes.STRING, defaultValue: null },
    placeNumber: { type: DataTypes.INTEGER, defaultValue: null },
    scanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  })
}
