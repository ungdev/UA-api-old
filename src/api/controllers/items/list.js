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
 * @param {object} itemModel model to query Items
 * @param {object} attributeModel model to query Attributes
 */
const List = (itemModel, attributeModel) => async (req, res) => {
  try {
    const items = await itemModel.findAll({
      attributes: ['id', 'name', 'key', 'price', 'infos', 'image'],
      include: {
        model: attributeModel,
        attributes: ['id', 'label', 'value'],
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
};

module.exports = List;
