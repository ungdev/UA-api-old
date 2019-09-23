'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    let tournaments = [{
      name: 'League of Legends (pro)',
      shortName: 'LoL (pro)',
      maxPlayers: 80,
      playersPerTeam: 5,
    }, {
      name: 'League of Legends (amateur)',
      shortName: 'LoL (amateur)',
      maxPlayers: 80,
      playersPerTeam: 5
    }, {
      name: 'Fortnite',
      shortName: 'Fortnite',
      maxPlayers: 96,
      playersPerTeam: 4
    }, {
      name: 'Counter Strike : Global Offensive',
      shortName: 'CS:GO',
      maxPlayers: 40,
      playersPerTeam: 5
    }, {
      name: 'Super Smash Bros Ultimate',
      shortName: 'SSBU',
      maxPlayers: 64,
      playersPerTeam: 1
    }, {
      name: 'osu!',
      shortName: 'osu!',
      maxPlayers: 16,
      playersPerTeam: 1
    }]

    tournaments = tournaments.map(tournament => ({
      ...tournament,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    return queryInterface.bulkInsert('tournaments', tournaments)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tournaments', null)
  }
};
