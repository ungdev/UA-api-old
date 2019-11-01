const Express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const database = require('./database');
const MainRoutes = require('./api/controllers');
const error = require('./api/middlewares/error.js');
const log = require('./api/utils/log.js');

module.exports = async () => {
  const { models } = await database();

  const api = Express();

  api.locals.models = models;

  api.use(
    morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
      stream: log.stream,
    }),
  );

  api.use(helmet());
  api.use(cors());
  api.use(bodyParser.json());

  api.use('/api/v1', MainRoutes(models));

  api.use(error.converter);
  api.use(error.notFound);
  api.use(error.handler);

  if (process.send) {
    process.send('ready');
  }

  return api;
};
