const isAdmin = require('../../middlewares/isAdmin');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * PUT /admin/switchPlaces/:id1/:id2
 *
 * Response: none
 *
 */
module.exports = (app) => {
  app.put('/admin/switchPlaces/:id1/:id2', [isAuth(), isAdmin()]);

  app.put('/admin/switchPlaces/:id1/:id2', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      if (req.body.id1 === null || req.body.id2 === null) {
        return res
          .status(400) // Bad request
          .json({ error: 'BAD_REQUEST' })
          .end();
      }

      const user1 = await User.findByPk(req.params.id1);
      const user2 = await User.findByPk(req.params.id2);

      const tmpTableLetter = user1.tableLetter;
      const tmpPlaceNumber = user1.placeNumber;

      await user1.update({
        tableLetter: user2.tableLetter,
        placeNumber: user2.placeNumber,
      });

      await user2.update({
        tableLetter: tmpTableLetter,
        placeNumber: tmpPlaceNumber,
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
