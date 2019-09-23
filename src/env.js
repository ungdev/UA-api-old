const path = require('path')
const dotenv = require('dotenv')

const log = require('./api/utils/log')(module)


const localConfig = dotenv.config({
  path: path.join(__dirname, '..', '.env')
})
module.exports = localConfig.parsed
  ? Object.assign({}, process.env, localConfig.parsed)
  : process.env
