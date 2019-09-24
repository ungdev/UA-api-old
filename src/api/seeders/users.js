/* eslint-disable no-unused-vars */

const { Op } = require('sequelize');

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
      },
      {
        id: '48fe6584-a118-4f85-8b6a-a2f26a1538b2',
        username: 'admin',
        firstname: 'Admi',
        lastname: 'Nistrateur',
        email: 'admin@local.dev',
        password: '$2y$10$WWfywWNGZHfDw2N2Bxqy..P0lj.p39tsLR6IKFckW7kU1cCXN00Oa', // password: admin
        permissions: 'admin',
      },
    ];

    users = users.map((user) => ({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return queryInterface.bulkInsert('users', users);
  },

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('users',
    {
      id: {
        [Op.or]: ['48fe6584-a118-4f85-8b6a-a2f26a1538b1', '48fe6584-a118-4f85-8b6a-a2f26a1538b2'],
      },
    }),
};
