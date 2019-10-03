/* eslint-disable no-unused-vars */

module.exports = {
  up: (queryInterface, Sequelize) => {
    let items = [{
      id: 1,
      name: 'Place joueur',
      key: 'player',
      price: 20,
    }, {
      id: 2,
      name: 'Place coach / manager / accompagnateur',
      key: 'visitor',
      price: 12,
      stock: 40,
    }, {
      id: 3,
      name: 'Câble ethernet (5M)',
      key: 'ethernet5',
      price: 5,
      infos: 'Un câble (5m) est requis pour se brancher aux switchs des tables',
    }, {
      id: 4,
      name: 'Câble ethernet (7M)',
      key: 'ethernet7',
      price: 10,
      infos: 'Un câble (7m) plus long pour les joueurs situés en bout de table',
    }, {
      id: 5,
      name: 'Multiprise 3 trous',
      key: 'multi-socket',
      price: 5,
      infos: 'Une mutltiprise 3 trous pour brancher tout le setup',
    }, {
      id: 6,
      name: 'T-shirt UA 2019 (Homme)',
      key: 'maleTshirt',
      price: 15,
      infos: 'Un t-shirt souvenir de cette LAN de folie',
    }, {
      id: 7,
      name: 'T-shirt UA 2019 (Femme)',
      key: 'femaleTshirt',
      price: 15,
      infos: 'Un t-shirt souvenir de cette LAN de folie',
    }, {
      id: 8,
      name: 'Tombola',
      key: 'tombola',
      price: 1,
      infos: 'Acheter des tickets de tombola à 1€ par ticket',
    }, {
      id: 9,
      name: 'Pin\'s',
      key: 'pins',
      price: 1,
      infos: 'Un pin\'s souvenir de cette LAN de folie',
    }];

    items = items.map((item) => ({
      ...item,
      stock: item.stock ? item.stock : -1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('items', items);
  },
};
