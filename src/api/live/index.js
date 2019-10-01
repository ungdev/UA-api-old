const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = (socket) => {
  fs.readdirSync(__dirname)
    .filter((name) => name !== 'index.js' && name.slice(-3) === '.js')
    .map((name) => require(path.join(__dirname, name)))
    .forEach((controller) => controller(socket));
};
