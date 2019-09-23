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

if (process.env.NODE_ENV === 'development') {
  module.exports = {
    development: credentials
  }
}

else {
  module.exports = {
    production: credentials
  }
}
