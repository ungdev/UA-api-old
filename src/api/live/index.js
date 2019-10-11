const fs = require('fs');
const path = require('path');

module.exports = (socket) => {
  fs.readdirSync(__dirname)
    .filter((name) => name !== 'index.js' && name.slice(-3) === '.js')
    // eslint-disable-next-line import/no-dynamic-require, global-require
    .map((name) => require(path.join(__dirname, name)))
    .forEach((controller) => controller(socket));
};
