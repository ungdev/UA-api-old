const jwt = require('jsonwebtoken');
const { check } = require('express-validator/check');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);
const { Base64 } = require('js-base64');
const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});

const { Basket } = etupay;

const euro = 100;
const gender = { H: 'Homme', F: 'Femme' };

module.exports = (app) => {
  app.post('/user/pay', [isAuth('user-pay')]);

  app.post('/user/pay', [
    check('plusone')
      .exists()
      .isBoolean(),
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

  app.post('/user/pay', async (req, res) => {
    if (process.env.ARENA_PAYMENT_DISABLED === '1') {
      return res
        .status(404)
        .json({ error: 'PAYMENT_DISABLED' })
        .end();
    }

    const { User, Team, Spotlight, Order } = req.app.locals.models;

    let totalPaidPlayers = await User.findAll({
      where: {
        paid: 1,
        plusone: 0,
      },
      attributes: ['id'],
      include: [{
        model: Team,
        attributes: ['id'],
        include: [{
          model: Spotlight,
          attributes: ['id'],
        }],
      }],
    });

    totalPaidPlayers = totalPaidPlayers.filter((player) => !player.team || (player.team && player.team.spotlight && player.team.spotlight.id !== 6)).length; // remove SSBU

    // Check if LAN is already full
    // TODO : ARENA_MAX_PLAYER_PLACES ??
    if (totalPaidPlayers >= process.env.ARENA_MAX_PLACES) {
      return res
        .status(404)
        .json({ error: 'LAN_FULL' })
        .end();
    }

    try {
      // Check if user has already paid his ticket
      if (req.user.paid) {
        return res
          .status(404)
          .json('ALREADY_PAID')
          .end();
      }

      // If user buy a visitor place
      if (req.body.plusone) {
        const count = await Order.count({ where: { plusone: true, paid: true } });

        if (count >= process.env.ARENA_VISITOR_LIMIT) {
          return res
            .status(404)
            .json({ error: 'VISITOR_FULL' })
            .end();
        }
      }

      // step 1 : save user's payment profile (place type, shirt, ethernet cable)
      let order = { place: true };
      order.plusone = req.body.plusone ? req.body.plusone : false;
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
      order = await Order.create(order);
      order.setUser(req.user);

      // step 2 : determine price (based on profile + mail)
      const partnerPrice = process.env.ARENA_PRICES_PARTNER_MAILS.split(',').some((partner) => req.user.email.toLowerCase().endsWith(partner));
      const data = Base64.encode(JSON.stringify({ userId: req.user.id, isInscription: true, orderId: order.id }));
      const price = partnerPrice ? process.env.ARENA_PRICES_PARTNER : process.env.ARENA_PRICES_DEFAULT;
      const basket = new Basket(
        'Inscription UTT Arena 2018',
        req.user.firstname,
        req.user.lastname,
        req.user.email,
        'checkout',
        data,
      );

      if (req.body.plusone) {
        basket.addItem(
          'Place UTT Arena Visiteur/Accompagnateur',
          euro * process.env.ARENA_PRICES_PLUSONE,
          1,
        );
      }
      else {
        basket.addItem('Place UTT Arena', euro * price, 1);
      }
      if (order.ethernet) basket.addItem('Cable Ethernet 5m', euro * process.env.ARENA_PRICES_ETHERNET, 1);
      if (order.ethernet7) basket.addItem('Cable Ethernet 7m', euro * process.env.ARENA_PRICES_ETHERNET7, 1);
      if (order.kaliento) basket.addItem('Location Kaliento', euro * process.env.ARENA_PRICES_KALIENTO, 1);
      if (order.mouse) basket.addItem('Location Souris', euro * process.env.ARENA_PRICES_MOUSE, 1);
      if (order.keyboard) basket.addItem('Location Clavier', euro * process.env.ARENA_PRICES_KEYBOARD, 1);
      if (order.headset) basket.addItem('Location Casque', euro * process.env.ARENA_PRICES_HEADSET, 1);
      if (order.screen24) basket.addItem('Location Ecran 24"', euro * process.env.ARENA_PRICES_SCREEN24, 1);
      if (order.screen27) basket.addItem('Location Ecran 27"', euro * process.env.ARENA_PRICES_SCREEN27, 1);
      if (order.chair) basket.addItem('Location Chaise Gaming', euro * process.env.ARENA_PRICES_CHAIR, 1);
      if (order.gamingPC) basket.addItem('Location PC Gaming', euro * process.env.ARENA_PRICES_GAMING_PC, 1);
      if (order.streamingPC) basket.addItem('Location PC Streaming', euro * process.env.ARENA_PRICES_STREAMING_PC, 1);
      if (order.laptop) basket.addItem('Location PC Portable', euro * process.env.ARENA_PRICES_LAPTOP, 1);
      if (order.tombola > 0) basket.addItem('Tombola', euro * process.env.ARENA_PRICES_TOMBOLA, order.tombola);
      if (order.shirt !== 'none') {
        basket.addItem(
          `T-Shirt ${gender[req.body.shirtGender]} ${req.body.shirtSize}`,
          euro * process.env.ARENA_PRICES_SHIRT,
          1,
        );
      }
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
