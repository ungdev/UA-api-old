const Express = require('express');
const List = require('./list.js');

const Item = models => {
    const router = Express.Router();
    router.get('/', List(models.Item, models.Attribute));
    return router;
};

module.exports = Item;
