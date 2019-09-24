const errorHandler = require('../../utils/errorHandler');

/**
 * get /networks/@mac
 *
 * Response:
 *
 */
module.exports = (app) => {
  app.get('/networks/:mac', async (req, res) => {
    const { Network, User, Team, Spotlight } = req.app.locals.models;
    const { mac } = req.params;
    try {
      const nw = await Network.findOne({ where: { mac },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'firstname', 'lastname'],
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
      if (!nw) return res.status(404).end();
      if (!nw.user) return res.status(407).end();
      const { user } = nw;
      let spotlight = 'libre';
      if (user.team && user.team.spotlight) spotlight = user.team.spotlight.shortName;
      if (!spotlight) spotlight = 'libre';
      if (spotlight === 'SSBU') spotlight = 'libre';
      res
        .status(200)
        .json({
          name: user.name,
          firstname: user.firstname,
          lastname: user.lastname,
          place: user.tableLetter && user.placeNumber ? `${user.tableLetter}${user.placeNumber}` : 'null',
          spotlight,
          ip: nw.ip,
          mac: nw.mac,
          switchId: nw.switchId,
          switchPort: nw.switchPort,
          isCaster: nw.isCaster,
          isBanned: nw.isBanned,
        })
        .end(); // everything's fine
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
