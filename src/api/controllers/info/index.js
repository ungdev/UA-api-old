const Express = require('express');

const hasPermission = require('../../middlewares/hasPermission');
const List = require('./list.js');
const { Create, CheckCreate } = require('./create.js');
const Delete = require('./delete.js');
const { SendNotificationToTournament } = require('../../utils/notification-sender.js');

const infoId = 'infoId';

const Info = (models) => {
  const router = Express.Router();
  router.get('/', List(models.Info, models.User));
  router.post(
    '/',
    hasPermission('anim'),
    CheckCreate,
    Create(models.Info, SendNotificationToTournament)
  );
  router.delete(
    `/:${infoId}`,
    hasPermission('anim'),
    Delete(infoId, models.Info)
  );
  return router;
};

module.exports = Info;
