module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    email: { type: DataTypes.STRING, validate: { isEmail: true }, unique: true, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    barcode: { type: DataTypes.STRING },
    place: { type: DataTypes.STRING },
    scanned: { type: DataTypes.BOOLEAN, defaultValue: false },
    permissions: { type: DataTypes.STRING },
    registerToken: { type: DataTypes.STRING },
    resetToken: { type: DataTypes.STRING },
  })
}
