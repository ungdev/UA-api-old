const dotenv = require('dotenv');
const database = require('../src/database');
const seedTournaments = require('./tournaments');
const seedTeams = require('./teams');
const seedUsers = require('./users');
const seedCarts = require('./cart');
const seedAttributes = require('./attributes');
const seedItems = require('./items');
const seedItemsHasAttributes = require('./itemshasattributes');
const seedCartItems = require('./cartsItems');

dotenv.config();

(async () => {
  const forceSync = process.argv.some((arg) => arg === '--force-sync');

  const { sequelize, models } = await database(forceSync);

  await seedTournaments(models.Tournament);
  await seedTeams(models.Team);
  await seedUsers(models.User);
  await seedCarts(models.Cart);
  await seedAttributes(models.Attribute);
  await seedItems(models.Item);
  await seedItemsHasAttributes(sequelize);
  await seedCartItems(models.Cart)

  sequelize.close();
})();