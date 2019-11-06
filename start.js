#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const log = require('./src/api/utils/log')(module);

const app = express();

require('./src')(app);

app.listen(process.env.ARENA_API_PORT, () => log.debug(`server started on port ${process.env.ARENA_API_PORT} [${process.env.NODE_ENV}]`));
