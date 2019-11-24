const { createLogger, format, transports } = require('winston');
const moment = require('moment');

const { combine, label, colorize, printf } = format;

const levelInfo = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'info'

    case 'test':
      return 'error'

    default:
      return 'debug'
  }
}

module.exports = (loggedModule) => {
  const path = loggedModule.filename
    .split('/')
    .slice(-2)
    .join('/')
    .split('.js')[0];

  const customFormat = printf(
    ({ level, message, label: location }) => `${moment().format('HH:mm:ss')} ${level}: [${location}] ${message}`,
  );

  const logger = createLogger({
    transports: [new transports.Console()],
    format: combine(colorize(), label({ label: path }), customFormat),
    level: levelInfo()
  });

  logger.stream = {
    write: (message) => logger.info(message),
  };

  return logger;
};
