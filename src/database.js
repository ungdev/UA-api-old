const Sequelize = require('sequelize')
const debug = require('debug')('arena.utt.fr-api:database')
const modelsFactory = require('./api/models')
const env = require('./env')

module.exports = async function database() {
  const sequelize = new Sequelize(env.ARENA_DB, {
    operatorsAliases: Sequelize.Op,
    logging: sql => debug(sql)
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

    debug('connected to database')

    return { sequelize, models }
  } catch (err) {
    throw err
  }
}
