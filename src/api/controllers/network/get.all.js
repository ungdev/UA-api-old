const errorHandler = require('../../utils/errorHandler');

/**
 * List all the network registered inside the app
 * get /networks
 *
 * Response:
 *
 */
const List = (networkModel, userModel) => async (req, res) => {
  try {
    let nws = await networkModel.findAll({
      include: [
        {
          model: userModel,
          attributes: [
            'id',
            'firstname',
            'lastname',
          ],
        },
      ],
    });
    nws = nws.map((nw) => {
      const { user } = nw;
      return {
        name: user ? user.name : null,
        firstname: user ? user.firstname : null,
        lastname: user ? user.lastname : null,
        place: null,
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
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = List;
