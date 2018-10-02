module.exports = function(sequelize) {
  const User = sequelize.import(`${__dirname}/user`)
  const Info = sequelize.import(`${__dirname}/info`)
  const Team = sequelize.import(`${__dirname}/team`)
  const Spotlight = sequelize.import(`${__dirname}/spotlight`)
  const AskingUser = sequelize.import(`${__dirname}/askingUser`)

  User.belongsTo(Team)
  Team.hasMany(User)

  Team.belongsTo(Spotlight)
  Spotlight.hasMany(Team)

  User.belongsToMany(Team, { through: AskingUser, as: 'RequestedTeam' })
  Team.belongsToMany(User, { through: AskingUser, as: 'AskingUser' })

  return { User, Team, Spotlight, AskingUser, Info }
}
