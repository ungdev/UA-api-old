
const log = require('../utils/log')(module);
const moment = require('moment');
const sendPdf = require('../utils/sendPDF');
const { sendInfosMail } = require('../utils/sendMailInfo');
const { Base64 } = require('js-base64');
const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});

async function leaveTeam(user, Team, User) {
  const team = await Team.findByPk(user.teamId);
  if (team) {
    if (team.captainId === user.id) {
      log.info(`user ${user.name} left ${team.name} and destroyed it, as captain`);
      const users = await User.findAll({ where: { teamId: team.id } });
      for (const u of users) {
        await u.update({
          joined_at: null,
          teamId: null,
        });
        await team.removeUser(u.id);
      }
      await team.destroy();
    }
    else {
      log.info(`User ${user.name} left his team because he paid a visitor place`);
      await user.update({
        joined_at: null,
        teamId: null,
      });
      await team.removeUser(user.id);
    }
  }
}
async function handlePayload(models, payload) {
  const { User, Team, Order } = models;
  try {
    const data = JSON.parse(Base64.decode(payload.serviceData));
    const { orderId, isInscription, userId } = data;
    const user = await User.findByPk(userId, { include: [Team] });


    if (!user) return { user: null, shouldSendMail: false, error: 'NULL_USER', transactionState: 'error' };
    if (isInscription) {
      const order = await Order.findByPk(orderId);
      if (user.paid || order.paid) return { user, shouldSendMail: false, error: 'ALREADY_PAID', transactionState: 'error' };

      order.transactionId = payload.transactionId;
      order.transactionState = payload.step;
      order.paid = payload.paid;
      if (order.paid) {
        user.paid = order.paid;
        order.paid_at = moment().format();
      }
      user.plusone = order.plusone;
      if (order.plusone) await leaveTeam(user, Team, User);

      log.info(`user ${user.name} is at state ${order.transactionState} for his order ${order.id}`);

      await user.save();
      await order.save();

      return {
        shouldSendMail: user.paid,
        user,
        error: null,
        transactionState: order.transactionState,
      };
    }

    const order = await Order.findByPk(orderId);
    if (order.paid) return { user, shouldSendMail: false, error: 'ALREADY_PAID' };

    order.transactionId = payload.transactionId;
    order.transactionState = payload.step;
    order.paid = payload.paid;
    if (order.paid) order.paid_at = moment().format();
    log.info(`user ${user.name} is at state ${order.transactionState} for his order ${order.id}`);
    await order.save();
    return {
      shouldSendMail: false,
      user,
      error: null,
      transactionState: order.transactionState,
    };
  }
  catch (err) {
    const body = JSON.stringify(payload, null, 2);

    log.info(`handle payload error: ${body}`);
    return { user: null, shouldSendMail: false, error: body, transactionState: 'error' };
  }
}

/**
 * POST /user/pay/{callback, success, error}
 * {
 *    etupay data
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/user/pay/callback', etupay.middleware, async (req, res) => {
    let { shouldSendMail, user, error } = await handlePayload(req.app.locals.models, req.etupay);
    if (error) return res.status(200).end();
    if (shouldSendMail) {
      const { User, Team, Order, Spotlight } = req.app.locals.models;
      user = await User.findByPk(user.id, { include: [{ model: Team, include: [Spotlight] }, Order] }); // add order to user
      await sendPdf(user);
      await sendInfosMail(user);
      log.info(`Mail sent to ${user.name}`);
    }

    return res
      .status(200)
      .json({})
      .end();
  });

  app.get('/user/pay/return', etupay.middleware, async (req, res, next) => {
    if (req.query.payload) {
      let { shouldSendMail, user, error, transactionState } = await handlePayload(req.app.locals.models, req.etupay);
      if (error) {
        if (error === 'ALREADY_PAID') return res.redirect(process.env.ARENA_ETUPAY_SUCCESSURL);
        return res.redirect(process.env.ARENA_ETUPAY_ERRORURL);
      }
      if (!user) {
        return res
          .status(404)
          .json({ error: 'USER_NOT_FOUND' })
          .end();
      }
      if (shouldSendMail) {
        const { User, Team, Order, Spotlight } = req.app.locals.models;
        user = await User.findByPk(user.id, { include: [{ model: Team, include: [Spotlight] }, Order] }); // add order to user
        await sendPdf(user);
        await sendInfosMail(user);
        log.info(`Mail sent to ${user.name}`);
      }
      if (transactionState !== 'paid') {
        log.info(`${user.name} was redirected to ${process.env.ARENA_ETUPAY_ERRORURL}`);
        return res.redirect(process.env.ARENA_ETUPAY_ERRORURL);
      }
      log.info(`${user.name} was redirected to ${process.env.ARENA_ETUPAY_SUCCESSURL}`);
      return res.redirect(process.env.ARENA_ETUPAY_SUCCESSURL);
    }

    next();
  });
};
