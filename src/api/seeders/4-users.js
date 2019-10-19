/* eslint-disable no-unused-vars */
const randomBarcode = require('../utils/randomBarcode');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let users = [
      {
        id: '48fe6584-a118-4f85-8b6a-a2f26a1538b1',
        username: 'user',
        firstname: 'kevin',
        lastname: 'keke',
        email: 'kevin@msn.fr',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e38',
        type: 'none',
      }, {
        id: '48fe6584-a118-4f85-8b6a-a2f26a1538b2',
        username: 'admin',
        firstname: 'Admi',
        lastname: 'Nistrateur',
        email: 'admin@local.dev',
        permissions: 'admin',
        type: 'none',
      },

      // Users for a team
      {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153801',
        username: 'user1',
        firstname: 'David',
        lastname: 'Guetta',
        email: 'user1@local.dev',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153802',
        username: 'user2',
        firstname: 'Pierre',
        lastname: 'Bonjour',
        email: 'user2@local.dev',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153803',
        username: 'user3',
        firstname: 'John',
        lastname: 'Doe',
        email: 'user3@local.dev',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153804',
        username: 'user4',
        firstname: 'Foo',
        lastname: 'Bar',
        email: 'user4@local.dev',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153805',
        username: 'user5',
        firstname: 'Blabla',
        lastname: 'Au revoir',
        email: 'user5@local.dev',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153806',
        username: 'visitor',
        firstname: 'Michel',
        lastname: 'Visitor',
        email: 'visitor@local.dev',
        type: 'visitor',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153807',
        username: 'user6',
        firstname: 'Blipblop',
        lastname: 'Boop',
        email: 'user6@utt.fr',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e38',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153808',
        username: 'user7',
        firstname: 'Jacques',
        lastname: 'Cheminade',
        email: 'user7@local.dev',
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e38',
        type: 'player',
      },
    ];

    users = users.map((user) => ({
      ...user,
      password: '$2y$10$ksHr/EzBi6cG2khzcqoxdeJ49tviChmZGDPH0DNQViexokGDpuIU6', // password: uttarena
      barcode: randomBarcode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return queryInterface.bulkInsert('users', users);
  },
};
