const isAdmin = require('../../middlewares/isAdmin');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /admin/setPlaces
 *
 * Response: none
 *
 */
module.exports = (app) => {
  app.post('/admin/setPlaces', [isAuth(), isAdmin()]);

  app.post('/admin/setPlaces', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      const { places } = req.body;

      places.forEach(async (place) => {
        const user = await User.findByPk(place.id);
        if (user) {
          await user.update({
            tableLetter: (place.tableLetter && place.tableLetter !== '') ? place.tableLetter : null,
            placeNumber: (place.placeNumber && place.placeNumber !== '') ? place.placeNumber : null,
          });
        }
      });

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
