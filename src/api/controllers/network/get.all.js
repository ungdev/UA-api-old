const errorHandler = require('../../utils/errorHandler');

/**
 * get /networks
 *
 * Response:
 *
 */
module.exports = (app) => {
  app.get('/networks', async (req, res) => {
    const { Network, User, Team, Spotlight } = req.app.locals.models;
    try {
      let nws = await Network.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'firstname', 'lastname', 'placeNumber', 'tableLetter'],
            include: [
              {
                model: Team,
                attributes: ['id'],
                include: [
                  {
                    model: Spotlight,
                    attributes: ['id', 'shortName'],
                  },
                ],
              },
            ],
          },
        ],
      });
      nws = nws.map((nw) => {
        const { user } = nw;
        let spotlight = null;
        let place = null;
        if (user) {
          spotlight = 'libre';
          if (user.team && user.team.spotlight) spotlight = user.team.spotlight.shortName;
          if (!spotlight) spotlight = 'libre';
          if (spotlight === 'SSBU') spotlight = 'libre';
          place = user.tableLetter && user.placeNumber ? `${user.tableLetter}${user.placeNumber}` : null;
        }
        return {
          name: user ? user.name : null,
          firstname: user ? user.firstname : null,
          lastname: user ? user.lastname : null,
          place,
          spotlight,
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
  });
};
