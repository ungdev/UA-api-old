const debug = require('debug')('arena.utt.fr-api:index')
const http = require('http')
const database = require('./database')
const socket = require('./socket')
const app = require('./app')
const env = require('./env')

async function arena() {
    const { sequelize, models } = await database()

    const server = http.Server(app)
    const io = socket(http, sequelize, models)

    app.locals.db = sequelize
    app.locals.models = models

    app.listen(env.ARENA_API_PORT, () => debug(`server started on port ${env.ARENA_API_PORT}`))
}

arena()
