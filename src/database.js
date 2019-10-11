const Sequelize = require('sequelize');
const modelsFactory = require('./api/models');

const log = require('./api/utils/log')(module);
const credentials = require('../config');

module.exports = async function database() {
  log.info(`Trying to connect to database : ${process.env.ARENA_DB_TYPE}://${process.env.ARENA_DB_USER}:******@${process.env.ARENA_DB_HOST}:${process.env.ARENA_DB_PORT}/${process.env.ARENA_DB_NAME}`);
  const sequelize = new Sequelize(process.env.ARENA_DB_NAME, process.env.ARENA_DB_USER, process.env.ARENA_DB_PASSWORD, {
    ...credentials.production,
    operatorsAliases: Sequelize.Op,
    logging: (sql) => log.info(sql),
  });

  process.on('SIGINT', async () => {
    try {
      await sequelize.close();
      process.exit(0);
    }
    catch (_) {
      process.exit(1);
    }
  });

  const models = modelsFactory(sequelize);
  await sequelize.sync();
  log.info('connected to database');

  return { sequelize, models };
};
