module.exports = function(sequelize) {
  const User = sequelize.import(`${__dirname}/user`)
  const Info = sequelize.import(`${__dirname}/info`)
  const Team = sequelize.import(`${__dirname}/team`)
  const Spotlight = sequelize.import(`${__dirname}/spotlight`)
  const AskingUser = sequelize.import(`${__dirname}/askingUser`)
  const Order = sequelize.import(`${__dirname}/order`)
  const Messages = sequelize.import(`${__dirname}/messages`)
  const Conversations = sequelize.import(`${__dirname}/conversations`)

  User.belongsTo(Team)
  Team.hasMany(User)

  Order.belongsTo(User)
  User.hasMany(Order)

  Team.belongsTo(Spotlight)
  Spotlight.hasMany(Team)

  User.belongsToMany(Team, { through: AskingUser, as: 'RequestedTeam' })
  Team.belongsToMany(User, { through: AskingUser, as: 'AskingUser' })

  Messages.belongsTo(User, {as: 'From', foreignKey: 'senderId'})
  Messages.belongsTo(User, {as: 'To', foreignKey: 'receiverId'})

  User.hasMany(Messages, {as: 'From', foreignKey: 'senderId'})
  User.hasMany(Messages, {as: 'To', foreignKey: 'receiverId'})

  Conversations.hasMany(Messages)

  Conversations.belongsTo(User, {as: 'User1', foreignKey: 'user1'})
  Conversations.belongsTo(User, {as: 'User2', foreignKey: 'user2'})




  return { User, Team, Spotlight, AskingUser, Info, Order, Messages, Conversations }
}
