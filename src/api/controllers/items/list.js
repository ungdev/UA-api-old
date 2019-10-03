const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /items
 * {
 *
 * }
 * Response
 * {
 *   Items
 * }
 */
module.exports = (app) => {
  app.get('/items', [isAuth()]);

  app.get('/items', async (req, res) => {
    const { Item, Attribute } = req.app.locals.models;
    try {
      const items = await Item.findAll({
        attributes: ['name', 'key', 'price', 'infos'],
        include: {
          model: Attribute,
          attributes: ['label', 'value'],
          through: {
            attributes: [],
          },
        },
      });


      return res
        .status(200)
        .json(items)
        .end();
    }

    catch (error) {
      return errorHandler(error, res);
    }
  });
};