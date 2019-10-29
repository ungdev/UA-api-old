const Express = require('express');

const etupay = require('../../utils/etupay.js');

const CreateCart = require('./create.js');
const DeleteItemFromCart = require('./delete.js');
const { AddItemToCart, CheckAddItem } = require('./add-item.js');
const { Edit, CheckEdit } = require('./edit.js');
const GetItemFromCart = require('./get-item-from-cart.js');
const { SuccessfulPayment, EtupayAvailable } = require('./etupay.callback');

const cartId = 'cartId';
const itemId = 'itemId';

const Cart = models => {
  const router = Express.Router();
  router.post('/', CreateCart(models.Cart));
  router.delete(
    `/:${cartId}/cartItems/:${itemId}`,
    DeleteItemFromCart(cartId, itemId, models.CartItem)
  );
  router.post(
    `/:${cartId}/add`,
    [CheckAddItem],
    AddItemToCart(cartId, models.CartItem, models.User, models.Cart)
  );
  router.put(
    `/:${cartId}/cartItems/:${itemId}`,
    CheckEdit,
    Edit(cartId, itemId, models.CartItem, models.User)
  );

  router.get(
    `/:${cartId}/cartItems/:${itemId}`,
    GetItemFromCart(
      cartId,
      itemId,
      models.CartItem,
      models.Item,
      models.Attribute
    )
  );
  router.get('/return', etupay.middleware, SuccessfulPayment());
  router.post('/callback', EtupayAvailable());
  return router;
};

module.exports = Cart;
