const path = require('path')
const dotenv = require('dotenv')

const log = require('./api/utils/log')(module)


const defaultConfig = dotenv.config({
  path: path.join(__dirname, '..', '.env')
})

const localConfig = dotenv.config({
  path: path.join(__dirname, '..', '.env.local')
})
module.exports = localConfig.parsed
  ? Object.assign({}, defaultConfig.parsed, process.env, localConfig.parsed)
  : Object.assign({},defaultConfig.parsed, process.env)
