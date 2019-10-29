const http = require('http');
const Express = require('express');
const database = require('./database');
const socket = require('./socket');
const MainRoutes = require('./api/controllers');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const error = require('./api/middlewares/error.js');
const morgan = require('morgan');
const log = require('./api/utils/log.js');

module.exports = async () => {
    const { sequelize, models } = await database();

    const api = Express();
    api.use(
        morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
            stream: log.stream,
        })
    );

    // app.locals.app = app;
    // app.locals.server = server;
    // app.locals.db = sequelize;
    api.locals.models = models;
    // app.locals.io = io;
    // app.locals.toornament = toornament;

    api.use(helmet());
    api.use(cors());
    api.use(bodyParser.json());

    api.use('/api/v1', MainRoutes(models));

    api.use(error.converter);
    api.use(error.notFound);
    api.use(error.handler);

    // const server = http.Server(app);
    const io = socket(http, sequelize, models);

    if (process.send) {
        process.send('ready');
    }

    return api;
};
