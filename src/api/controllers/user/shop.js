const { check } = require('express-validator');
const { Base64 } = require('js-base64');

const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

const { Basket } = etupay;

/**
 * POST /user/shop
 * {
 *    plusone: Boolean,
 *    ethernet: Boolean,
 *    shirtGender: String?,
 *    shirtSize: String?
 * }
 *
 * Response:
 * {
 *    url: String
 * }
 */
module.exports = (app) => {
  app.post('/user/shop', [isAuth('user-pay')]);

  app.post('/user/shop', [
    check('ethernet')
      .exists()
      .isBoolean(),
    check('ethernet7')
      .exists()
      .isBoolean(),
    check('tombola')
      .optional(),
    check('shirtGender')
      .optional()
      .isIn(['H', 'F']),
    check('shirtSize')
      .optional()
      .isIn(['XS', 'S', 'M', 'L', 'XL']),
    check('kaliento')
      .optional(),
    check('mouse')
      .optional(),
    check('keyboard')
      .optional(),
    check('headset')
      .optional(),
    check('screen24')
      .optional(),
    check('screen27')
      .optional(),
    check('chair')
      .optional(),
    check('gamingPC')
      .optional(),
    check('streamingPC')
      .optional(),
    check('laptop')
      .optional(),
    validateBody(),
  ]);

  app.post('/user/shop', async (req, res) => {
    if (process.env.ARENA_PAYMENT_DISABLED === '1') return res.status(404).json({ error: 'PAYMENT_DISABLED' }).end();
    try {
      let order = {};
      order.ethernet = req.body.ethernet ? req.body.ethernet : false;
      order.ethernet7 = req.body.ethernet7 ? req.body.ethernet7 : false;
      order.tombola = req.body.tombola ? req.body.tombola : 0;
      order.kaliento = req.body.kaliento ? req.body.kaliento : false;
      order.mouse = req.body.mouse ? req.body.mouse : false;
      order.keyboard = req.body.keyboard ? req.body.keyboard : false;
      order.headset = req.body.headset ? req.body.headset : false;
      order.screen24 = req.body.screen24 ? req.body.screen24 : false;
      order.screen27 = req.body.screen27 ? req.body.screen27 : false;
      order.chair = req.body.chair ? req.body.chair : false;
      order.gamingPC = req.body.gamingPC ? req.body.gamingPC : false;
      order.streamingPC = req.body.streamingPC ? req.body.streamingPC : false;
      order.laptop = req.body.laptop ? req.body.laptop : false;
      order.shirt = 'none';

      if (req.body.shirtGender && req.body.shirtSize) {
        order.shirt = req.body.shirtGender.toLowerCase() + req.body.shirtSize.toLowerCase();
      }
      // save order
      order = await req.app.locals.models.Order.create(order);
      order.setUser(req.user);

      // eslint-disable-next-line max-len
      const data = Base64.encode(JSON.stringify({ userId: req.user.id, isInscription: false, orderId: order.id }));

      const basket = new Basket(
        'Achats supplémentaires UTT Arena 2018',
        req.user.firstname,
        req.user.lastname,
        req.user.email,
        'checkout',
        data,
      );

      return res
        .status(200)
        .json({ url: basket.compute() })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
