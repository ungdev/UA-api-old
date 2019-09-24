const { check } = require('express-validator/check');
const moment = require('moment');
const isAdmin = require('../../middlewares/isAdmin');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

/**
 * POST /admin/chart
 *
 * Response:
 * [
 *    { time, count }, ...
 * ]
 */
module.exports = (app) => {
  app.post('/admin/chart', [isAuth(), isAdmin()]);
  app.post('/admin/chart', [
    check('start')
      .exists(),
    check('end')
      .exists(),
    check('mode')
      .exists(),
    check('step')
      .exists(),
    validateBody(),
  ]);

  app.post('/admin/chart', async (req, res) => {
    const { Order } = req.app.locals.models;
    const { step, mode } = req.body;
    const startBody = req.body.start;
    const endBody = req.body.end;

    try {
      let totalPaidOrders = await Order.findAll({
        where: {
          paid: 1,
          place: 1,
          plusone: 0,
        },
      });

      const start = moment(startBody);
      const end = moment(endBody).add(1, 'day'); // include end date

      totalPaidOrders = totalPaidOrders
        .filter((order) => moment(order.paid_at)
          .isAfter(start) && moment(order.paid_at)
          .isBefore(end));

      const result = [];
      let format = 'YYYY-MM-DD';
      let adding = 'days';

      switch (step) {
        case 'hour':
          format = 'YYYY-MM-DD-HH';
          adding = 'hours';
          break;
        default:
          break;
      }

      let current = moment(start);
      const ending = moment(end);
      let i = 0;
      let count = 0;

      do {
        i++;
        totalPaidOrders.forEach((order) => {
          if (moment(order.paid_at).format(format) === current.format(format)) {
            count++;
          }
        });

        result.push({
          time: current.format('DD/MM'),
          count,
        });

        current = current.add(1, adding);

        if (mode === 'daily') {
          count = 0;
        }
      } while (i < 100 && !current.isSameOrAfter(ending));

      return res
        .status(200)
        .json(result)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};