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
const List = (itemModel, attributeModel) => {
    return async (req, res) => {
        try {
            const items = await itemModel.findAll({
                attributes: ['name', 'key', 'price', 'infos', 'id'],
                include: {
                    model: attributeModel,
                    attributes: ['label', 'value', 'id'],
                    through: {
                        attributes: [],
                    },
                },
            });

            return res
                .status(200)
                .json(items)
                .end();
        } catch (error) {
            return errorHandler(error, res);
        }
    };
};

module.exports = List;
