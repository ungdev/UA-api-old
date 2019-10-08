const stream = require('stream');
const { Op } = require('sequelize');

const generatePdf = require('../../utils/sendPDF');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

module.exports = (app) => {
  app.get('/users/:id/ticket', isAuth());

  app.get('/users/:id/ticket', async (req, res) => {
    const { User, CartItem, Item, Cart } = req.app.locals.models;

    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      // todo: pas compatible admin
      if (user.id !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }


      const place = await CartItem.findOne({
        where: {
          forUserId: req.params.id,
          itemId: {
            [Op.or]: [1, 2],
          },
        },
        attributes: [],
        include: [{
          model: Item,
          attributes: ['name'],
        }, {
          model: Cart,
          attributes: [],
          where: {
            transactionState: 'paid',
          },
        }],
      });

      if (!place) {
        return res
          .status(400)
          .json({ error: 'NOT_PAID' })
          .end();
      }

      const pdf = await generatePdf(user, place.item.name);

      const readStream = new stream.PassThrough();
      readStream.end(pdf);

      res.setHeader('Content-disposition', 'inline; filename="ticket.pdf"');
      res.setHeader('Content-type', 'application/pdf');

      return readStream.pipe(res);
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};