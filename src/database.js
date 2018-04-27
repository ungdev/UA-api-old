const Sequelize = require('sequelize')
const modelsFactory = require('./api/models')
const env = require('./env')
const log = require('./api/utils/log')(module)

module.exports = async function database() {
  const sequelize = new Sequelize(env.ARENA_DB, {
    operatorsAliases: Sequelize.Op,
    logging: sql => log.debug(sql)
  })


  process.on('SIGINT', async function () {
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

    log.info('connected to database', { database: env.ARENA_DB })

    return { sequelize, models }
  } catch (err) {
    throw err
  }
}
