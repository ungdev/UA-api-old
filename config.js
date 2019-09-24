const env = require('./src/env');

const credentials = {
  username: env.ARENA_DB_USER,
  password: env.ARENA_DB_PASSWORD,
  database: env.ARENA_DB_NAME,
  host: env.ARENA_DB_HOST,
  port: env.ARENA_DB_PORT,
  dialect: env.ARENA_DB_TYPE,
  dialectOptions: {
    multipleStatements: true
  }
};

module.exports = {
  development: credentials,
  production: credentials
}
