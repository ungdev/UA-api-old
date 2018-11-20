module.exports = function(sequelize) {
  const User = sequelize.import(`${__dirname}/user`)
  const Info = sequelize.import(`${__dirname}/info`)
  const Team = sequelize.import(`${__dirname}/team`)
  const Spotlight = sequelize.import(`${__dirname}/spotlight`)
  const AskingUser = sequelize.import(`${__dirname}/askingUser`)
  const Order = sequelize.import(`${__dirname}/order`)
  const Network = sequelize.import(`${__dirname}/network`)
  const Deck = sequelize.import(`${__dirname}/deck`)
  const State = sequelize.import(`${__dirname}/state`)

  User.belongsTo(Team)
  Team.hasMany(User)

  Order.belongsTo(User)
  User.hasMany(Order)

  Network.belongsTo(User)
  User.hasMany(Network)
  
  Deck.belongsTo(Team) //we attach decks to the user team
  Team.hasMany(Deck)

  Team.belongsTo(Spotlight)
  Spotlight.hasMany(Team)

  State.belongsTo(Spotlight)
  Spotlight.hasMany(State)

  User.belongsToMany(Team, { through: AskingUser, as: 'RequestedTeam' })
  Team.belongsToMany(User, { through: AskingUser, as: 'AskingUser' })

  return { User, Team, Spotlight, AskingUser, Info, Order, Network, Deck, State }
}
