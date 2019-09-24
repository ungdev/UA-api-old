const axios = require('axios');

const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');
/**
 * GET /matches/:id
 * {
 *    spotlightID: Spotlight.toornamentID
 * }
 *
 * https://developer.toornament.com/v2/doc/viewer_matches
 * Response:
 * {
 *    matches: [Matches]
 * }
 */
module.exports = (app) => {
  app.get('/spotlights/:id/matches', [isAuth()]);
  app.get('/spotlights/:id/matches', async (req, res) => {
    const { Spotlight } = req.app.locals.models;
    try {
      const { expiresIn, resetAccessToken, accessToken } = req.app.locals.toornament;
      const spotlight = await Spotlight.findByPk(req.params.id);
      const { toornamentID } = spotlight.toJSON();
      if (expiresIn < Date.now()) {
        resetAccessToken();
      }
      const resp = await axios.get(`${toornamentID}/matches`, {
        baseURL: 'https://api.toornament.com/organizer/v2/tournaments',
        headers: {
          'X-Api-Key': process.env.TOORNAMENT_KEY,
          Authorization: `Bearer ${accessToken}`,
          Range: 'matches=0-99' },
      });
      return res
        .status(200)
        .json(resp.data)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
