const errorHandler = require('../../utils/errorHandler');

/**
 * get /networks/@mac
 *
 * Response:
 *
 * @param {string} macStringName name of the parameter in the route
 * @param {object} networkModel
 * @param {object} userModel
 * @param {object} teamModel
 *
 */
const GetByMac = (macStringName, networkModel, userModel, teamModel) => {
    return async (req, res) => {
        const mac = req.params[macStringName];
        try {
            const nw = await networkModel.findOne({
                where: {
                    mac,
                },
                include: [
                    {
                        model: userModel,
                        attributes: ['id', 'firstname', 'lastname'],
                    },
                ],
            });
            console.log(nw);
            if (!nw) return res.status(404).end();
            if (!nw.user) return res.status(407).end();
            const { user } = nw;
            return res
                .status(200)
                .json({
                    firstname: user.firstname,
                    lastname: user.lastname,
                    place:
                        user.tableLetter && user.placeNumber
                            ? `${user.tableLetter}${user.placeNumber}`
                            : 'null',
                    ip: nw.ip,
                    mac: nw.mac,
                    switchId: nw.switchId,
                    switchPort: nw.switchPort,
                    isCaster: nw.isCaster,
                    isBanned: nw.isBanned,
                })
                .end(); // everything's fine
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = GetByMac;
