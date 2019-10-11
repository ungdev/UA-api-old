/* eslint-disable no-unused-vars */
const random = require('../utils/random');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let users = [
      {
        id: '48fe6584-a118-4f85-8b6a-a2f26a1538b1',
        username: 'user',
        firstname: 'kevin',
        lastname: 'keke',
        email: 'kevin@msn.fr',
        password: '$2y$10$zxL.B7cSpGVa6mfdLp0Y0OxfU/lQaFlD9pK8CoDnlPBjGzbd25qJK', // password: user
        type: 'none',
      }, {
        id: '48fe6584-a118-4f85-8b6a-a2f26a1538b2',
        username: 'admin',
        firstname: 'Admi',
        lastname: 'Nistrateur',
        email: 'admin@local.dev',
        password: '$2y$10$WWfywWNGZHfDw2N2Bxqy..P0lj.p39tsLR6IKFckW7kU1cCXN00Oa', // password: admin
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
        password: '$2y$10$zxL.B7cSpGVa6mfdLp0Y0OxfU/lQaFlD9pK8CoDnlPBjGzbd25qJK', // password: user
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153802',
        username: 'user2',
        firstname: 'Pierre',
        lastname: 'Bonjour',
        email: 'user2@local.dev',
        password: '$2y$10$zxL.B7cSpGVa6mfdLp0Y0OxfU/lQaFlD9pK8CoDnlPBjGzbd25qJK', // password: user
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153803',
        username: 'user3',
        firstname: 'John',
        lastname: 'Doe',
        email: 'user3@local.dev',
        password: '$2y$10$zxL.B7cSpGVa6mfdLp0Y0OxfU/lQaFlD9pK8CoDnlPBjGzbd25qJK', // password: user
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153804',
        username: 'user4',
        firstname: 'Foo',
        lastname: 'Bar',
        email: 'user4@local.dev',
        password: '$2y$10$zxL.B7cSpGVa6mfdLp0Y0OxfU/lQaFlD9pK8CoDnlPBjGzbd25qJK', // password: user
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      }, {
        id: '48fe6584-a118-4f85-8b6a-f2f26a153805',
        username: 'user5',
        firstname: 'Blabla',
        lastname: 'Au revoir',
        email: 'user5@local.dev',
        password: '$2y$10$zxL.B7cSpGVa6mfdLp0Y0OxfU/lQaFlD9pK8CoDnlPBjGzbd25qJK', // password: user
        teamId: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
        type: 'player',
      },
    ];

    users = users.map((user) => ({
      ...user,
      barcode: random(process.env.ARENA_API_BARCODE_LENGTH),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return queryInterface.bulkInsert('users', users);
  },
};
