const { Op } = require('sequelize');

const generateTicket = require('../../utils/generateTicket');
const errorHandler = require('../../utils/errorHandler');

const GetTicket = (userIdString, userModel, cartItemModel, itemModel, cartModel) => async (req, res) => {
  try {
    const userId = req.params[userIdString];
    const user = await userModel.findByPk(userId);

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

    const place = await cartItemModel.findOne({
      where: {
        forUserId: userId,
        itemId: {
          [Op.or]: [1, 2],
        },
      },
      attributes: [],
      include: [
        {
          model: itemModel,
          attributes: ['name'],
        },
        {
          model: cartModel,
          attributes: [],
          where: {
            transactionState: 'paid',
          },
        },
      ],
    });

    if (!place) {
      return res
        .status(400)
        .json({ error: 'NOT_PAID' })
        .end();
    }

    // Generate base64 encoded ticket
    const doc = await generateTicket(user, place.item.name, true);

    res.set('Content-Type', 'application/pdf');
    return res.send(doc);
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = GetTicket;
