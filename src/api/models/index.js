module.exports = function(sequelize) {
  const User = sequelize.import(`${__dirname}/user`)
  const Info = sequelize.import(`${__dirname}/info`)
  const Team = sequelize.import(`${__dirname}/team`)
  const Spotlight = sequelize.import(`${__dirname}/spotlight`)
  const AskingUser = sequelize.import(`${__dirname}/askingUser`)
  const Order = sequelize.import(`${__dirname}/order`)
  const Message = sequelize.import(`${__dirname}/message`)
  const Conversation = sequelize.import(`${__dirname}/conversation`)

  User.belongsTo(Team)
  Team.hasMany(User)

  Order.belongsTo(User)
  User.hasMany(Order)

  Team.belongsTo(Spotlight)
  Spotlight.hasMany(Team)

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




  return { User, Team, Spotlight, AskingUser, Info, Order, Message, Conversation }
}
