module.exports = function (sequelize) {
  const Cart = sequelize.import(`${__dirname}/cart`);
  const CartItem = sequelize.import(`${__dirname}/cartItem`);
  const Info = sequelize.import(`${__dirname}/info`);
  const Item = sequelize.import(`${__dirname}/item`);
  const Message = sequelize.import(`${__dirname}/message`);
  const Network = sequelize.import(`${__dirname}/network`);
  const State = sequelize.import(`${__dirname}/state`);
  const Team = sequelize.import(`${__dirname}/team`);
  const Tournament = sequelize.import(`${__dirname}/tournament`);
  const User = sequelize.import(`${__dirname}/user`);

  // Relations
  Cart.hasMany(CartItem);

  Item.hasOne(CartItem);

  Team.hasMany(User);

  Tournament.hasMany(Team);
  Tournament.hasMany(State);
  Tournament.hasMany(Info);

  User.hasOne(Network);
  User.hasMany(Message);
  User.hasMany(Cart);

  // Associations
  User.belongsTo(Team, { as: 'askingTeam', constraints: false });
  Team.belongsTo(User, { as: 'captain', constraints: false });
  CartItem.belongsTo(User, { as: 'forUser', constraints: false });
  Tournament.belongsTo(State, { as: 'index', constraints: false });


  return { Cart, CartItem, Info, Item, Message, Network, State, Team, Tournament, User };
};
