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
  app.get('/matches/:id', [isAuth()]);
  app.get('/matches/:id', async (req, res) => {
    try {
      const { expiresIn, resetAccessToken, accessToken } = req.app.locals.toornament;
      if (expiresIn < Date.now()) {
        resetAccessToken();
      }
      const resp = await axios.get(`${req.query.spotlightID}/matches`, {
        baseURL: 'https://api.toornament.com/organizer/v2/tournaments',
        headers: {
          'X-Api-Key': env.TOORNAMENT_KEY,
          Authorization: `Bearer ${accessToken}`,
          Range: 'matches=0-64' },
        params: { participant_ids: req.params.id } });
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
