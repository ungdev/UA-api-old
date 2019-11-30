const Express = require('express');

const etupay = require('../../utils/etupay');
const isAuth = require('../../middlewares/isAuth');
const hasPermission = require('../../middlewares/hasPermission');

const CreateCart = require('./create');
const DeleteItemFromCart = require('./delete');
const { AddItemToCart, CheckAddItem } = require('./addItem');
const { Edit, CheckEdit } = require('./edit');
const GetItemFromCart = require('./getItemFromCart');
const Refund = require('./refund');
const { SuccessfulPayment, EtupayAvailable } = require('./etupayCallback');

const cartId = 'cartId';
const itemId = 'itemId';

const Cart = (models) => {
  const router = Express.Router();
  router.post('/', isAuth(), CreateCart(models.Cart));
  router.put(
    `/:${cartId}`,
    isAuth(),
    hasPermission('admin'),
    Refund(cartId, models.Cart),
  );
  router.delete(
    `/:${cartId}/cartItems/:${itemId}`,
    isAuth(),
    DeleteItemFromCart(cartId, itemId, models.CartItem),
  );
  router.post(
    `/:${cartId}/add`,
    isAuth(),
    CheckAddItem,
    AddItemToCart(cartId, models.CartItem, models.User, models.Cart, models.Team, models.Tournament, models.Item),
  );
  router.put(
    `/:${cartId}/cartItems/:${itemId}`,
    isAuth(),
    CheckEdit,
    Edit(cartId, itemId, models.CartItem, models.User),
  );
  router.get(
    `/:${cartId}/cartItems/:${itemId}`,
    isAuth(),
    GetItemFromCart(
      cartId,
      itemId,
      models.CartItem,
      models.Item,
      models.Attribute,
    ),
  );
  router.get('/return',
    etupay.middleware,
    SuccessfulPayment(
      models.Cart,
      models.CartItem,
      models.Item,
      models.Attribute,
      models.User,
    ),
  );
  router.post('/callback', EtupayAvailable());
  return router;
};

module.exports = Cart;
