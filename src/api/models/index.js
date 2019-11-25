module.exports = (sequelize) => {
  const Attribute = sequelize.import(`${__dirname}/attribute.js`);
  const Cart = sequelize.import(`${__dirname}/cart.js`);
  const CartItem = sequelize.import(`${__dirname}/cartItem.js`);
  const Info = sequelize.import(`${__dirname}/info.js`);
  const Item = sequelize.import(`${__dirname}/item.js`);
  const Team = sequelize.import(`${__dirname}/team.js`);
  const Tournament = sequelize.import(`${__dirname}/tournament.js`);
  const User = sequelize.import(`${__dirname}/user.js`);

  // Relations

  Team.hasMany(User);
  User.belongsTo(Team);

  Tournament.hasMany(Team, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });
  Team.belongsTo(Tournament, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });

  Tournament.hasMany(Info, {
    foreignKey: { allowNull: true },
    onDelete: 'cascade',
  });
  Info.belongsTo(Tournament, {
    foreignKey: { allowNull: true },
    onDelete: 'cascade',
  });

  User.hasMany(Info);
  Info.belongsTo(User);

  User.hasMany(Cart, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });
  Cart.belongsTo(User, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });

  Cart.hasMany(CartItem, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });
  CartItem.belongsTo(Cart, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });

  Item.hasMany(CartItem, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });
  CartItem.belongsTo(Item, {
    foreignKey: { allowNull: false },
    onDelete: 'cascade',
  });

  CartItem.belongsTo(Attribute);
  Attribute.hasMany(CartItem);

  Attribute.belongsToMany(Item, { through: 'itemshasattributes' });
  Item.belongsToMany(Attribute, { through: 'itemshasattributes' });

  // Associations
  Team.hasMany(User, { as: 'askingTeam', contraints: false });
  User.belongsTo(Team, { as: 'askingTeam', constraints: false });

  User.hasOne(Team, { as: 'captain', constraints: false });
  Team.belongsTo(User, { as: 'captain', constraints: false });

  CartItem.belongsTo(User, { foreignKey: 'forUserId', as: 'forUser' });
  User.hasMany(CartItem, { foreignKey: 'forUserId', as: 'forUser' });
  User.hasMany(CartItem, { foreignKey: 'userId', as: 'userCart' });
  CartItem.belongsTo(User, { foreignKey: 'userId', as: 'userCart' });

  return {
    Attribute,
    Cart,
    CartItem,
    Info,
    Item,
    Team,
    Tournament,
    User,
  };
};
