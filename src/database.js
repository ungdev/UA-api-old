const Sequelize = require('sequelize')
const modelsFactory = require('./api/models')
const env = require('./env')
const log = require('./api/utils/log')(module)
const credentials = require('../config')

module.exports = async function database() {
  log.info(`Trying to connect to database : ${env.ARENA_DB_TYPE}://******:******@${env.ARENA_DB_HOST}:${env.ARENA_DB_PORT}/${env.ARENA_DB_NAME}`)
  const sequelize = new Sequelize(env.ARENA_DB_NAME, env.ARENA_DB_USER, env.ARENA_DB_PASSWORD, {
    ...credentials.production,
    operatorsAliases: Sequelize.Op,
    logging: sql => log.debug(sql)
  })

  process.on('SIGINT', async function() {
    try {
      await sequelize.close()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })

  try {
    const models = modelsFactory(sequelize)

    await sequelize.sync()

    log.info('connected to database')

    return { sequelize, models }
  } catch (err) {
    throw err
  }
}
