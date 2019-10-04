module.exports = (sequelize) => {
  const Attribute = sequelize.import(`${__dirname}/attribute`);
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
  CartItem.belongsTo(Cart);

  Item.hasOne(CartItem);
  CartItem.belongsTo(Item);

  Team.hasMany(User);
  User.belongsTo(Team);

  Tournament.hasMany(Team);
  Team.belongsTo(Tournament);
  Tournament.hasMany(State);
  State.belongsTo(Tournament);
  Tournament.hasMany(Info);
  Info.belongsTo(Tournament);

  User.hasOne(Network);
  User.hasMany(Message);
  Message.belongsTo(User);
  User.hasMany(Cart);
  Cart.belongsTo(User);

  CartItem.belongsTo(Attribute);
  Attribute.hasMany(CartItem);
  Attribute.belongsToMany(Item, { through: 'itemshasattributes' });
  Item.belongsToMany(Attribute, { through: 'itemshasattributes' });


  // Associations
  User.belongsTo(Team, { as: 'askingTeam', constraints: false });
  Team.hasMany(User, { as: 'askingTeam', contraints: false });
  Team.belongsTo(User, { as: 'captain', constraints: false });
  User.hasOne(Team, { as: 'captain', constraints: false });
  CartItem.belongsTo(User, { as: 'forUser', constraints: false });
  User.hasMany(CartItem, { as: 'forUser', constraints: false });
  Tournament.belongsTo(State, { as: 'index', constraints: false });

  return { Attribute, Cart, CartItem, Info, Item, Message, Network, State, Team, Tournament, User };
};
