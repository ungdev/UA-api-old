const Sequelize = require('sequelize');

const modelFactory = require('./api/models');
const log = require('./api/utils/log.js')(module);

module.exports = async function database() {
  log.info(
    `Trying to connect to database : ${process.env.ARENA_DB_TYPE}://${process.env.ARENA_DB_USER}:******@${process.env.ARENA_DB_HOST}:${process.env.ARENA_DB_PORT}/${process.env.ARENA_DB_NAME}`,
  );

  const sequelize = new Sequelize({
    dialect: process.env.ARENA_DB_TYPE,
    username: process.env.ARENA_DB_USER,
    password: process.env.ARENA_DB_PASSWORD,
    host: process.env.ARENA_DB_HOST,
    port: process.env.ARENA_DB_PORT,
    database: `${process.env.ARENA_DB_NAME}${process.env.NODE_ENV === 'test' ? '_test' : ''}`,
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
