const winston = require('winston');

module.exports = (loggedModule) => {
  const path = loggedModule.filename
    .split('/')
    .slice(-2)
    .join('/')
    .split('.js')[0];

  const consoleTransport = new winston.transports.Console({
    timestamp: () => new Date().toISOString(),
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    name: 'console',
    prettyPrint: true,
    colorize: true,
    label: path,
  });

  const logger = new winston.Logger({
    transports: [consoleTransport],
  });

  logger.stream = {
    write: (message) => logger.info(message),
  };

  return logger;
};
