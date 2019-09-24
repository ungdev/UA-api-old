/* eslint-disable no-unused-vars */

module.exports = {
  up: (queryInterface, Sequelize) => {
    let items = [{
      name: 'Place joueur',
      key: 'player',
      price: 100,
    }, {
      name: 'Place visiteur',
      key: 'visitor',
      price: 50,
    }, {
      name: 'Câble ethernet (5M)',
      key: 'ethernet',
      price: 5,
      infos: 'Un câble (5m) est requis pour se brancher aux switchs des tables',
    }, {
      name: 'Câble ethernet (7M)',
      key: 'ethernet7',
      price: 10,
      infos: 'Un câble (7m) plus long pour les joueurs situés en bout de table',
    }, {
      name: 'T-shirt UA 2019',
      key: 'shirt',
      price: 15,
      infos: 'Un t-shirt souvenir de cette LAN de folie',
      attributes: '{"shirtSizes": [{"label": "XS", "value": "XS"}, {"label": "S", "value": "S"}, {"label": "M", "value": "M"}, {"label": "L", "value": "L"}, {"label": "XL", "value": "XL"}]}',
    }, {
      name: 'Tombola',
      key: 'tombola',
      price: 1,
      infos: 'Acheter des tickets de tombola à 1€ par ticket',
    }];

    items = items.map((item) => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('items', items);
  },

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('items', null),
};
