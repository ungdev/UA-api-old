/* eslint-disable global-require, import/no-dynamic-require */
const express = require('express');
const fs = require('fs');
const path = require('path');
const log = require('../utils/log')(module);

module.exports = (app) => {
  const router = new express.Router();

  router.locals = app.locals;

  const traverseDir = (dir) => {
    fs.readdirSync(dir)
      .forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath)
          .isDirectory()) {
          traverseDir(fullPath);
        }
        else if (!fullPath.endsWith('index.js') && fullPath.slice(-3) === '.js') {
          const controller = require(fullPath.slice(0, -3));
          controller(router);
        }
      });
  };

  traverseDir(__dirname);
  log.info('Controllers imported');

  return router;
};
