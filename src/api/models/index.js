module.exports = function(sequelize) {
  const User = sequelize.import(`${__dirname}/user`)
  const Info = sequelize.import(`${__dirname}/info`)
  const Team = sequelize.import(`${__dirname}/team`)
  const Permission = sequelize.import(`${__dirname}/permission`)
  const Spotlight = sequelize.import(`${__dirname}/spotlight`)
  const AskingUser = sequelize.import(`${__dirname}/askingUser`)
  const Order = sequelize.import(`${__dirname}/order`)
  const Message = sequelize.import(`${__dirname}/message`)
  const Conversation = sequelize.import(`${__dirname}/conversation`)
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

  Permission.belongsTo(User)
  User.hasOne(Permission)
  
  State.belongsTo(Spotlight)
  Spotlight.hasMany(State)

  User.belongsToMany(Team, { through: AskingUser, as: 'RequestedTeam' })
  Team.belongsToMany(User, { through: AskingUser, as: 'AskingUser' })

  Message.belongsTo(User, {as: 'From', foreignKey: 'senderId'})
  Message.belongsTo(User, {as: 'To', foreignKey: 'receiverId'})

  User.hasMany(Message, {as: 'From', foreignKey: 'senderId'})
  User.hasMany(Message, {as: 'To', foreignKey: 'receiverId'})

  Message.belongsTo(Conversation)
  Conversation.hasMany(Message)

  Conversation.belongsTo(User, {as: 'User1', foreignKey: 'user1'})
  Conversation.belongsTo(User, {as: 'User2', foreignKey: 'user2'})

  return { User, Team, Spotlight, AskingUser, Info, Order, Permission, Message, Conversation, Network, Deck, State }
}
