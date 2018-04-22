#!/usr/bin/env node

'use strict'

const express = require('express')
const debug = require('debug')('arena.utt.fr-api:bin')
const app = express()
const env = require('../src/env')

require('../src')(app, express)

const { name } = require('../package.json')

app.listen(env.ARENA_API_PORT, () => debug(`server started on port ${env.ARENA_API_PORT}`))
