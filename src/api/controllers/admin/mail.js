const isAdmin = require('../../middlewares/isAdmin');
const isAuth = require('../../middlewares/isAuth');
const generateTicket = require('../../utils/generateTicket');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /admin/mail/:name
 *
 * Response: none
 *
 */
module.exports = (app) => {
  app.get('/admin/mail/:name', [isAuth(), isAdmin()]);

  app.get('/admin/mail/:name', async (req, res) => {
    const { User, Order } = req.app.locals.models;

    try {
      const user = await User.findOne({ where: { name: req.params.name }, include: [Order] });
      await generateTicket(user);

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
