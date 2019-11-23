const Express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');

const database = require('./database');
const MainRoutes = require('./api/controllers');
const error = require('./api/middlewares/error.js');
const log = require('./api/utils/log.js');

module.exports = async () => {
  const { models } = await database();

  const api = Express();
  api.locals.models = models;

  // Console logs
  api.use(
    morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
      stream: log.stream,
    }),
  );

  // File logs
  morgan.token('username', (req) => (req.user ? req.user.username : 'anonymous'));
  morgan.token('team', (req) => (req.user && req.user.team ? req.user.team.name : 'no-team'));
  morgan.token('tournament', (req) => (req.user && req.user.team ? req.user.team.tournamentId : 'no-tournament'));

  api.use(
    morgan(':remote-addr - :username - :team - :tournament - [:date[clf]] :method :status :url - :response-time ms', {
      stream: fs.createWriteStream(`${process.env.ARENA_LOGS_PATH}/access.log`, { flags: 'a' }),
      skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV === 'development',
    }),
  );

  api.use(helmet());
  api.use(cors());
  api.use(bodyParser.json());

  api.use('/api/v1', MainRoutes(models));
  api.use('/api/v1/uploads', Express.static(process.env.ARENA_FILES_TO_SERVE));

  api.use(error.converter);
  api.use(error.notFound);
  api.use(error.handler);

  if (process.send) {
    process.send('ready');
  }

  return api;
};
