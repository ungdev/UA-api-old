const morgan = require('morgan')
const bodyParser = require('body-parser')
const compress = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const controllers = require('./api/controllers')
const error = require('./api/middlewares/error')
const env = require('./env')

module.exports = app => {
  app.use(morgan(env.ARENA_API_LOGS))
  app.use(helmet())
  app.use(cors())
  app.use(bodyParser.json())

  app.use('/api/v1', controllers(app))

  app.use(error.converter)
  app.use(error.notFound)
  app.use(error.handler)

  return app
}
