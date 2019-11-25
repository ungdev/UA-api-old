const Express = require('express');

const etupay = require('../../utils/etupay.js');
const isAuth = require('../../middlewares/isAuth.js');
const hasPermission = require('../../middlewares/hasPermission.js');

const CreateCart = require('./create.js');
const DeleteItemFromCart = require('./delete.js');
const { AddItemToCart, CheckAddItem } = require('./addItem.js');
const { Edit, CheckEdit } = require('./edit.js');
const GetItemFromCart = require('./getItemFromCart.js');
const Refund = require('./refund.js');
const { SuccessfulPayment, EtupayAvailable } = require('./etupayCallback.js');

const cartId = 'cartId';
const itemId = 'itemId';

const Cart = (models) => {
  const router = Express.Router();
  router.post(
    '/',
    isAuth(),
    CreateCart(models.Cart),
  );
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
    AddItemToCart(cartId, models.CartItem, models.User, models.Cart),
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
  router.post(
    '/callback',
    EtupayAvailable(),
  );
  return router;
};

module.exports = Cart;
