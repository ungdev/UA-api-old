const Express = require('express');
const ServeFile = require('./serve-file.js');

const fileId = 'fileId';

const File = () => {
  const router = Express.Router();
  router.get(
    `/:${fileId}`,
    ServeFile(fileId, process.env.ARENA_FILES_TO_SERVE)
  );
  return router;
};

module.exports = File;
