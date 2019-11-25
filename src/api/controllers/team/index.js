const Express = require('express');

const isNotInTeam = require('../../middlewares/isNotInTeam.js');
const isCaptain = require('../../middlewares/isCaptain.js');
const isType = require('../../middlewares/isType.js');
const isSelfTeam = require('../../middlewares/isSelfTeam.js');

const { Create, CheckCreate } = require('./create.js');
const Delete = require('./delete.js');
const { AddUser, CheckAddUser } = require('./addUsers.js');
const KickUser = require('./kickUser.js');
const Get = require('./get.js');
const { Edit, CheckEdit } = require('./edit.js');
const List = require('./list.js');
const Request = require('./request.js');
const { RefuseRequest, CheckRefuseRequest } = require('./refuse.js');

const teamId = 'teamId';
const userId = 'userId';

/**
 * defines all routes for the Team resource :
 * + POST `/teams/` create a team
 * + POST `/teams/{teamId}` add a user to the team
 * + DELETE `/teams/{id}` delete a team
 * + DELETE `/teams/{teamId}` delete a user from the team
 *
 * @param {*} models
 */
const Team = (models) => {
  const router = Express.Router();
  router.post(
    '/',
    [isNotInTeam(), CheckCreate],
    Create(models.Tournament, models.Team, models.User),
  );
  router.delete(
    `/:${teamId}`,
    [isCaptain(teamId), isType('player')],
    Delete(teamId, models.Team),
  );
  router.post(
    `/:${teamId}/users`,
    [isCaptain(teamId), isType('player'), CheckAddUser],
    AddUser(teamId, models.User, models.Team, models.Tournament),
  );
  router.delete(
    `/:${teamId}/users/:${userId}`,
    [isType('player')],
    KickUser(teamId, userId, models.User, models.Team),
  );

  router.put(
    `/:${teamId}`,
    [isType('player'), CheckEdit],
    Edit(teamId, models.Team),
  );

  router.get(
    `/:${teamId}`,
    [isSelfTeam(teamId)],
    Get(
      teamId,
      models.Team,
      models.User,
      models.Tournament,
      models.Cart,
      models.CartItem,
    ),
  );

  router.get('/', List(models.Team, models.Tournament, models.User));
  router.post(
    `/:${teamId}/request`,
    Request(teamId, models.Team, models.User, models.Tournament),
  );
  router.delete(
    `/:${teamId}/request`,
    [CheckRefuseRequest],
    RefuseRequest(teamId, models.User),
  );
  return router;
};
module.exports = Team;
