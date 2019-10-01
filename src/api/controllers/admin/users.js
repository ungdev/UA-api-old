const errorHandler = require('../../utils/errorHandler');
const isOrga = require('../../middlewares/isOrga');
const isAuth = require('../../middlewares/isAuth');
const log = require('../../utils/log')(module);

/**
 * GET /admin/users
 *
 * Response:
 * [
 *    { id, name, firstname, lastname, email, paid, teamId, spotlightId, permission, orders }, ...
 * ]
 */
module.exports = (app) => {
  app.get('/admin/users', [isAuth(), isOrga()]);

  app.get('/admin/users', async (req, res) => {
    const { User, Team, Order, Permission } = req.app.locals.models;

    try {
      const users = await User.findAll({
        include: [Team, Order, Permission],
        order: [
          ['name', 'ASC'],
        ],
      });

      const usersData = users.map((user) => {
        // Get user orders
        const orders = user.orders.map((order) => ({
          paid: order.paid,
          paid_at: order.paid_at,
          transactionState: order.transactionState,
          place: order.place,
          plusone: order.plusone,
          material: {
            ethernet: order.ethernet,
            ethernet7: order.ethernet7,
            kaliento: order.kaliento,
            mouse: order.mouse,
            keyboard: order.keyboard,
            headset: order.headset,
            screen24: order.screen24,
            screen27: order.screen27,
            chair: order.chair,
            gamingPC: order.gamingPC,
            streamingPC: order.streamingPC,
            laptop: order.laptop,
            tombola: order.tombola,
            shirt: order.shirt,
          },
        }));

        // Get user permission
        const permission = {
          respo: user.permission ? user.permission.respo : null,
          admin: user.permission ? user.permission.admin : false,
          permission: user.permission ? user.permission.permission : null,
        };

        // Get place
        let place = '';

        if (user.tableLetter && user.placeNumber) {
          place = `${user.tableLetter}${user.placeNumber}`;
        }

        return {
          id: user.id,
          name: user.name,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          paid: user.paid,
          teamId: user.team ? user.team.id : '/',
          team: user.team ? user.team.name : '/',
          spotlightId: user.team ? user.team.spotlightId : '/',
          permission,
          orders,
          place,
          scanned: user.scanned,
        };
      });

      return res
        .status(200)
        .json(usersData)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
