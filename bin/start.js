#!/usr/bin/env node

// this will be overrided by .env and .env.local
process.env.NODE_ENV = 'production';

require('dotenv').config();
const express = require('express');
const debug = require('debug')('arena.utt.fr-api:bin');

const app = express();


require('../src')(app);

app.listen(process.env.ARENA_API_PORT, () => debug(`server started on port ${process.env.ARENA_API_PORT} [${process.env.NODE_ENV}]`));
