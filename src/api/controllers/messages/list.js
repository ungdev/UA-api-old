const Sequelize = require('sequelize');
const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
const log = require('../../utils/log')(module);

module.exports = (app) => {
  app.get('/messages', [isAuth()]);
  app.get('/messages', async (req, res) => {
    const { Message, User, Team, Spotlight } = req.app.locals.models;
    try {
      const messages = await Message.findAll({
        order: [['createdAt', 'ASC']],
        attributes: ['message'],
        where: {
          [Sequelize.Op.or]: [
            { senderId: req.user.id },
            { receiverId: req.user.id },
          ],
        },
        include: [
          {
            model: User,
            as: 'From',
            attributes: ['id', 'name'],
            include: [
              {
                model: Team,
                attributes: ['spotlightId'],
                include: [
                  {
                    model: Spotlight,
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
          {
            model: User,
            as: 'To',
            attributes: ['id', 'name'],
          },
        ],
      });
      return res
        .status(200)
        .json(messages)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });

  app.get('/messages/:id', async (req, res) => {
    const { Message, User, Team, Spotlight } = req.app.locals.models;

    try {
      const messages = await Message.findAll({
        order: [['createdAt', 'ASC']],
        where: {
          [Sequelize.Op.or]: [
            { senderId: req.params.id },
            { receiverId: req.params.id },
          ],
        },
        include: [
          {
            model: User,
            as: 'From',
            attributes: ['id', 'name'],
            include: [
              {
                model: Team,
                attributes: ['spotlightId'],
                include: [
                  {
                    model: Spotlight,
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });
      return res
        .status(200)
        .json(messages)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
