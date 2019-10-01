const errorHandler = require('../../utils/errorHandler');

/**
 * get /networks/@mac
 *
 * Response:
 *
 */
module.exports = (app) => {
  app.get('/networks-stats', async (req, res) => {
    const { Network, User, Team, Spotlight } = req.app.locals.models;
    try {
      const networks = await Network.findAll({
        attributes: ['id', 'isBanned', 'isCaster'],
        include: [{
          model: User,
          attributes: ['id'],
          include: [
            {
              model: Team,
              attributes: ['id'],
              include: [{
                model: Spotlight,
                attributes: ['id', 'shortName'],
              }],
            },
          ],
        }],
      });
      const rows = [];
      let auth = null;
      let streamers = null;
      let banned = null;
      const spotlights = ['LoL pro', 'LoL amateur', 'Fortnite', 'CS:GO', 'Hearthstone', 'SSBU', 'osu'];
      for (let i = 1; i < 8; i++) {
        auth = networks.filter((nw) => nw.user && nw.user.team
          && nw.user.team.spotlight && nw.user.team.spotlight.id === i);
        streamers = auth.filter((nw) => nw.isCaster).length;
        banned = auth.filter((nw) => nw.isBanned).length;
        rows.push([spotlights[i - 1], auth.length, streamers, banned]);
      }
      auth = networks.filter((nw) => nw.user && !nw.user.team);
      streamers = auth.filter((nw) => nw.isCaster).length;
      banned = auth.filter((nw) => nw.isBanned).length;
      rows.push(['libre', auth.length, streamers, banned]);
      res
        .status(200)
        .json([
          {
            columns: [
              { text: 'Tournois', type: 'string' },
              { text: 'Authentifié', type: 'number' },
              { text: 'Streamer', type: 'number' },
              { text: 'Ban', type: 'number' },
            ],
            rows,
            type: 'table',
          },
        ])
        .end(); // everything's fine
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
