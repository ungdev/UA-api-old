const path = require('path')
const dotenv = require('dotenv')

const log = require('./api/utils/log')(module)
log.info(`Process env variables : ${process.env.ARENA_DB_TYPE}://${process.env.ARENA_DB_USER}:PASSWORD@${process.env.ARENA_DB_HOST}:${process.env.ARENA_DB_PORT}/${process.env.ARENA_DB_NAME}`)


const defaultConfig = dotenv.config({
  path: path.join(__dirname, '..', '.env')
})

const localConfig = dotenv.config({
  path: path.join(__dirname, '..', '.env.local')
})

module.exports = localConfig.parsed
  ? Object.assign({}, defaultConfig.parsed, localConfig.parsed)
  : defaultConfig.parsed
