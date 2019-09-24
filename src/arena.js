const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const controllers = require('./api/controllers');
const error = require('./api/middlewares/error');
const log = require('./api/utils/log')(module);

module.exports = (app) => {
  app.use(
    morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: log.stream }),
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
