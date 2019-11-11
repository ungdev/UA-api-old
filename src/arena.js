const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const controllers = require('./api/controllers');
const error = require('./api/middlewares/error');
const log = require('./api/utils/log')(module);

module.exports = (app) => {
  app.use(
    morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
      stream: log.stream,
    }),
  );

  morgan.token('username', (req) => (req.user ? req.user.username : 'anonymous'));
  morgan.token('team', (req) => (req.user && req.user.team ? req.user.team.name : 'no-team'));
  morgan.token('tournament', (req) => (req.user && req.user.team ? req.user.team.tournamentId : 'no-tournament'));

  app.use(
    morgan(':remote-addr - :username - :team - :tournament - [:date[clf]] :method :status :url - :response-time ms', {
      stream: fs.createWriteStream(`${process.env.ARENA_LOGS_PATH}/access.log`, { flags: 'a' }),
      skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV === 'development',
    }),
  );

  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json());

  app.use('/api/v1', controllers(app));

  app.use(error.converter);
  app.use(error.notFound);
  app.use(error.handler);

  return app;
};
