#!/usr/bin/env node

// this will be overrided by .env
process.env.NODE_ENV = 'production';

require('dotenv').config();
const debug = require('debug')('arena.utt.fr-api:bin');

const main = async () => {
    const api = await require('./src')();
    api.listen(process.env.ARENA_API_PORT, () =>
        debug(
            `server started on port ${process.env.ARENA_API_PORT} [${process.env.NODE_ENV}]`
        )
    );
};

main();
