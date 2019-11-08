const Sequelize = require('sequelize');
const modelFactory = require('./api/models');

const log = require('./api/utils/log')(module);
const { production: credentials } = require('../config');

module.exports = async function database() {
  const connectionURI = `${credentials.dialect}://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.database}`;
  log.info(`Trying to connect to database : ${credentials.dialect}://${credentials.username}:******@${credentials.host}:${credentials.port}/${credentials.database}`);

  const sequelize = new Sequelize(connectionURI, { logging: (sql) => log.info(sql) });

  process.on('SIGINT', async () => {
    try {
      await sequelize.close();
      process.exit(0);
    }
    catch (err) {
      process.exit(1);
    }
  });

  const models = modelFactory(sequelize);
  await sequelize.sync();
  log.info('connected to database');

  return { sequelize, models };
};
