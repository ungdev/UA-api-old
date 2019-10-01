const isAdmin = require('../../middlewares/isAdmin');
const isAuth = require('../../middlewares/isAuth');
const { sendInfosMail } = require('../../utils/sendMailInfo');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * GET /admin/informationsMail
 *
 * Response:
 *
 */

module.exports = (app) => {
  app.get('/admin/informationsMail', [isAuth(), isAdmin()]);

  app.get('/admin/informationsMail', async (req, res) => {
    const { User, Team, Spotlight } = req.app.locals.models;

    try {
      const allPaidUsers = await User.findAll({ attributes: ['email', 'name', 'id'], where: { paid: 1, registerToken: null }, include: [{ model: Team, include: [Spotlight] }] });

      for (const user of allPaidUsers) {
        await sendInfosMail(user);
      }
      return res
        .status(200)
        .json(allPaidUsers)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
