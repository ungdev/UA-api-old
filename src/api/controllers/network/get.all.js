const errorHandler = require('../../utils/errorHandler');

/**
 * List all the network registered inside the app
 * get /networks
 *
 * Response:
 *
 */
const List = (networkModel, userModel, teamModel) => {
    return async (req, res) => {
        try {
            let nws = await networkModel.findAll({
                include: [
                    {
                        model: userModel,
                        attributes: [
                            'id',
                            'firstname',
                            'lastname',
                            //'placeNumber',
                            //'tableLetter',
                        ],
                    },
                ],
            });
            nws = nws.map(nw => {
                const { user } = nw;
                let place = null;
                if (user) {
                    place =
                        user.tableLetter && user.placeNumber
                            ? `${user.tableLetter}${user.placeNumber}`
                            : null;
                }
                return {
                    name: user ? user.name : null,
                    firstname: user ? user.firstname : null,
                    lastname: user ? user.lastname : null,
                    place,
                    ip: nw.ip,
                    mac: nw.mac,
                    switchId: nw.switchId,
                    switchPort: nw.switchPort,
                    isCaster: nw.isCaster,
                    isBanned: nw.isBanned,
                };
            });

            return res
                .status(200)
                .json(nws)
                .end(); // everything's fine
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = List;
