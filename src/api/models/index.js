module.exports = function(sequelize) {
  const User = sequelize.import(`${__dirname}/user`)
  const Info = sequelize.import(`${__dirname}/info`)
  const Team = sequelize.import(`${__dirname}/team`)
  const Permission = sequelize.import(`${__dirname}/permission`)
  const Spotlight = sequelize.import(`${__dirname}/spotlight`)
  const AskingUser = sequelize.import(`${__dirname}/askingUser`)
  const Order = sequelize.import(`${__dirname}/order`)
  const Network = sequelize.import(`${__dirname}/network`)

  User.belongsTo(Team)
  Team.hasMany(User)

  Order.belongsTo(User)
  User.hasMany(Order)

  Network.belongsTo(User)
  User.hasMany(Network)

  Team.belongsTo(Spotlight)
  Spotlight.hasMany(Team)

  Permission.belongsTo(User)
  User.hasOne(Permission)

  User.belongsToMany(Team, { through: AskingUser, as: 'RequestedTeam' })
  Team.belongsToMany(User, { through: AskingUser, as: 'AskingUser' })

  return { User, Team, Spotlight, AskingUser, Info, Order, Permission, Network }
}
