const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compress = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const controllers = require('./api/controllers')
const error = require('./api/middlewares/error')
const env = require('./env')

const app = express()

app.use(morgan(env.ARENA_API_LOGS))
app.use(helmet())
app.use(cors())

app.use('/api/v1', controllers())

app.use(error.converter)
app.use(error.notFound)
app.use(error.handler)

module.exports = app
