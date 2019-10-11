require('dotenv').config();

const credentials = {
  username: process.env.ARENA_DB_USER,
  password: process.env.ARENA_DB_PASSWORD,
  database: process.env.ARENA_DB_NAME,
  host: process.env.ARENA_DB_HOST,
  port: process.env.ARENA_DB_PORT,
  dialect: process.env.ARENA_DB_TYPE,
  dialectOptions: {
    multipleStatements: true,
  },
};

module.exports = {
  development: credentials,
  production: credentials,
};
