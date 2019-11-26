const Express = require('express');

const { Edit, CheckEdit } = require('./edit.js');
const { List, CheckList } = require('./list.js');
const GetUser = require('./getUser.js');
const GetTicket = require('./getTicket.js');
const GetUserCart = require('./getUserCart.js');
const ListCartsFromUser = require('./listCarts.js');
const PayCart = require('./payCart.js');
const WipeItemsFromCart = require('./wipeItemsFromCart.js');

const userId = 'userId';
const cartId = 'cartId';

const User = (models) => {
  const router = Express.Router();
  router.put(
    `/:${userId}`,
    CheckEdit,
    Edit(userId, models.Cart, models.CartItem),
  );
  router.get(
    `/:${userId}`,
    GetUser(userId, models.User, models.Team, models.Cart, models.CartItem),
  );
  router.get(
    '/',
    [CheckList],
    List(
      models.User,
      models.Team,
      models.Tournament,
      models.Cart,
      models.CartItem,
    ),
  );
  router.get(
    `/:${userId}/ticket`,
    GetTicket(userId, models.User, models.CartItem, models.Item, models.Cart),
  );
  router.get(
    `/:${userId}/carts/current`,
    GetUserCart(
      userId,
      models.Cart,
      models.Item,
      models.CartItem,
      models.Attribute,
      models.User,
    ),
  );
  router.get(
    `/:${userId}/carts`,
    ListCartsFromUser(
      userId,
      models.Cart,
      models.Item,
      models.CartItem,
      models.Attribute,
    ),
  );
  router.post(
    `/:${userId}/carts/:${cartId}/pay`,
    PayCart(
      userId,
      cartId,
      models.User,
      models.Tournament,
      models.Team,
      models.Item,
      models.Cart,
      models.CartItem,
      models.Attribute,
    ),
  );
  router.delete(
    `/:${userId}/carts/current/items`,
    WipeItemsFromCart(userId, models.CartItem, models.Cart),
  );
  return router;
};

module.exports = User;
