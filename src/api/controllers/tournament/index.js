const Express = require('express');

const List = require('./list.js');
const GetTeams = require('./getTeams.js');
const Get = require('./get.js');

const Tournament = (models) => {
  const router = Express.Router();
  router.get('/', List(models.Tournament, models.Team, models.User, models.CartItem, models.Cart));
  router.get(
    '/:tournamentId/teams',
    GetTeams(models.Team, models.User, models.Tournament, models.CartItem, models.Cart),
  );
  router.get(
    '/:tournamentId',
    Get(models.Tournament, models.Team, models.User),
  );
  return router;
};

module.exports = Tournament;
