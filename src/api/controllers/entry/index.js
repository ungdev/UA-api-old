const Express = require('express');

const Scan = require('./scan.js');
const Search = require('./search.js');
const ForcePay = require('./forcePay.js');

const userId = 'userId';

const Entry = (models) => {
  const router = Express.Router();
  router.post('/scan', Scan(models.User, models.Team, models.Tournament, models.Cart, models.CartItem));
  router.get('/user', Search(models.User, models.Team, models.Tournament, models.CartItem, models.Cart, models.Item, models.Attribute));
  router.post(`/forcePay/:${userId}`, ForcePay(userId, models.User, models.Cart, models.CartItem));
  return router;
};

module.exports = Entry;
