const { check } = require('express-validator');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

const CheckEdit = [
    check('switchId').exists(),
    check('switchPort').exists(),
    validateBody(),
];

/**
 * Add the switch id and the switch port for a specified mac
 * put /networks/@mac
 *
 * Response:
 * @param {string} macStringName name of the route parameter for the mac address
 * @param {object} networkModel
 */
const Edit = (macStringName, networkModel) => {
    return async (req, res) => {
        const mac = req.params[macStringName];
        const { switchId, switchPort } = req.body;
        try {
            const nw = await networkModel.findOne({ where: { mac } });
            if (!nw) return res.status(404).end();
            await nw.update({
                switchId,
                switchPort,
            });
            return res.status(200).end(); // everything's fine
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { Edit, CheckEdit };
