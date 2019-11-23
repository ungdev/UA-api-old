const Sequelize = require('sequelize');

const modelFactory = require('./api/models');
const log = require('./api/utils/log.js')(module);
const { production: credentials } = require('../config.js');

module.exports = async function database() {
  log.info(
    `Trying to connect to database : ${credentials.dialect}://${credentials.username}:******@${credentials.host}:${credentials.port}/${credentials.database}`,
  );

  const sequelize = new Sequelize({
    dialect: credentials.dialect,
    username: credentials.username,
    password: credentials.password,
    host: credentials.host,
    port: credentials.port,
    database: `${credentials.database}${process.env.NODE_ENV === 'test' ? '_test' : ''}`,
    logging: (sql) => process.env.NODE_ENV !== 'test' ? log.info(sql) : ''
  });

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
  await sequelize.sync({ force: process.env.NODE_ENV === 'test' });
  log.info('connected to database');

  return { sequelize, models };
};
