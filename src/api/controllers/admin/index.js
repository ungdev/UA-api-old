const Express = require('express');

const hasPermission = require('../../middlewares/hasPermission');
const { List, CheckList } = require('./list.js');
const GigaSearch = require('./gigaSearch.js');
const { UpdateUser, CheckUpdateUser } = require('./updateUser.js');

const userId = 'userId';

const Admin = (models) => {
  const router = Express.Router();
  router.get('/users',
    hasPermission('anim'),
    CheckList,
    List(models.User, models.Team, models.Tournament, models.Cart, models.CartItem, models.Item)
  );
  router.get('/users/search',
    hasPermission('anim'),
    GigaSearch(models.User, models.Team, models.Tournament, models.Cart, models.CartItem, models.Item)
  );
  router.put(`/users/:${userId}`,
    hasPermission('admin'),
    CheckUpdateUser,
    UpdateUser(models.User, userId)
  );
  return router;
};

module.exports = Admin;