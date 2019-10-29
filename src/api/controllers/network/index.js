const Express = require('express');
const { Create, CheckCreate } = require('./create.js');
const List = require('./get.all.js');
const GetByMac = require('./get.js');
const { Edit, CheckEdit } = require('./put.js');

const mac = 'mac';

const Network = models => {
    const router = Express.Router();
    router.post('/', CheckCreate, Create(models.Network));
    router.get('/', List(models.Network, models.User, models.Team));
    router.get(
        `/:${mac}`,
        GetByMac(mac, models.Network, models.User, models.Team)
    );
    router.put(`/:${mac}`, CheckEdit, Edit(mac, models.Network));
    return router;
};
module.exports = Network;
