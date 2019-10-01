const { check } = require('express-validator');
const hasPermission = require('../../middlewares/hasPermission');
const isAuth = require('../../middlewares/isAuth');
const sendPdf = require('../../utils/sendPDF');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');
const log = require('../../utils/log')(module);
const moment = require('moment');

/**
 * POST /admin/forcepay
 *
 * Response:
 *  user
 */
module.exports = (app) => {
  app.post('/admin/forcepay', [isAuth(), hasPermission('payment')]);
  app.post('/admin/forcepay', [
    check('userId')
      .exists(),
    validateBody(),
  ]);

  app.post('/admin/forcepay', async (req, res) => {
    const { User, Team, Order } = req.app.locals.models;

    try {
      let user = await User.findOne({
        where: { id: req.body.userId },
        include: [Order],
      });
      if (!user) return res.status(404).json({ error: 'NOT_FOUND' }).end();

      let order = { place: true };
      order.plusone = false;
      order.ethernet = false;
      order.ethernet7 = false;
      order.tombola = 0;
      order.kaliento = false;
      order.mouse = false;
      order.keyboard = false;
      order.headset = false;
      order.screen24 = false;
      order.screen27 = false;
      order.chair = false;
      order.gamingPC = false;
      order.streamingPC = false;
      order.laptop = false;
      order.shirt = 'none';

      order.transactionState = 'paid';
      order.paid = true;
      order.paid_at = moment().format();

      user.paid = true;
      user.paid_at = moment().format();
      user.plusone = false;
      user.registerToken = null;
      user.scanned = true;

      order = await Order.create(order);
      order.setUser(user);
      await user.save();
      await order.save();
      log.info(`Forced ${user.name}'s payment`);

      user = await User.findByPk(user.id, { include: [Team, Order] }); // add order to user
      await sendPdf(user);
      log.info(`Mail sent to ${user.name}`);

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
