/* eslint-disable no-unused-vars */

module.exports = {
  up: (queryInterface, Sequelize) => {
    let teams = [
      {
        id: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        name: 'La Team des Winners',
        tournamentId: 1,
      }, {
        id: '49ee896a-6ff2-4324-b3b7-c3454ca32e38',
        name: 'La Team des Loosers',
        tournamentId: 3,
      }];

    teams = teams.map((team) => ({
      ...team,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('teams', teams);
  },
};
