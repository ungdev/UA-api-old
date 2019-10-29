const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');

const CheckCreate = [
    check('mac').exists(),
    check('ip').exists(),
    check('userId')
        .isUUID()
        .exists(),
    validateBody(),
];

/**
 * Insert a new network in database, or update an existing one
 * POST /network
 *
 * Response:
 * @param {object} networkModel the model to query the network
 *
 */
const Create = networkModel => {
    return async (req, res) => {
        const { mac, ip, userId } = req.body;
        try {
            let nw = await networkModel.findOne({
                where: {
                    mac,
                },
            });
            if (!nw) nw = await networkModel.create({ mac, ip, userId });
            else {
                await nw.update({ ip });
            }
            return res.status(200).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { Create, CheckCreate };
