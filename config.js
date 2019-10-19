require('dotenv').config();

const credentials = {
  dialect: process.env.ARENA_DB_TYPE,
  host: process.env.ARENA_DB_HOST,
  port: process.env.ARENA_DB_PORT,
  username: process.env.ARENA_DB_USER,
  password: process.env.ARENA_DB_PASSWORD,
  database: process.env.ARENA_DB_NAME,
  dialectOptions: {
    multipleStatements: true,
  },
};

module.exports = {
  development: credentials,
  production: credentials,
};