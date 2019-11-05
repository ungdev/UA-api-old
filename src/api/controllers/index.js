/* eslint-disable global-require, import/no-dynamic-require */

const Express = require('express');
const isAuth = require('../middlewares/isAuth.js');
const resttrictToIp = require('../middlewares/restrictToIP.js');
const hasPermission = require('../middlewares/hasPermission');

const Auth = require('./auth');
const Cart = require('./cart');
const User = require('./user');
const Tournament = require('./tournament');
const Team = require('./team');
const Item = require('./items');
const Entry = require('./entry');
const Network = require('./network');
const File = require('./files');

const MainRoutes = models => {
  const mainRouter = Express.Router();
  mainRouter.use('/auth', Auth(models));
  mainRouter.use('/users', [isAuth()], User(models));
  mainRouter.use('/tournaments', [isAuth()], Tournament(models));
  mainRouter.use('/carts', [isAuth()], Cart(models));
  mainRouter.use('/teams', [isAuth()], Team(models));
  mainRouter.use('/items', [isAuth()], Item(models));
  mainRouter.use('/entry', [isAuth(), hasPermission('entry')], Entry(models));
  mainRouter.use('/files', File());
  mainRouter.use(
    '/network',
    resttrictToIp(['::1', 'awdawdawd']),
    Network(models)
  );
  return mainRouter;
};

module.exports = MainRoutes;
