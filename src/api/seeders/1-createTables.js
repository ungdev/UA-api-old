/* eslint-disable no-unused-vars */

const modelsFactory = require('../models');

module.exports = {
  up: (queryInterface, Sequelize) => {
    modelsFactory(queryInterface.sequelize);

    return queryInterface.sequelize.sync();
  },
};
