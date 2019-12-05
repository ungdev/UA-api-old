#!/usr/bin/env node
require('dotenv').config();
const debug = require('debug')('arena.utt.fr-api:bin');
const { initiateAPI } = require('./src/api/utils/APIToornament');

const main = async () => {
    initiateAPI();
    const api = await require('./src')();
    api.listen(process.env.ARENA_API_PORT, () =>
        debug(
            `server started on port ${process.env.ARENA_API_PORT} [${process.env.NODE_ENV}]`
        )
    );
};

main();
