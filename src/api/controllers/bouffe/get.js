const errorHandler = require('../../utils/errorHandler');

/**
 * GET /bouffe/place/:place
 *
 * Response:
 * [
 *    { id, name, firstname, lastname, email, paid, teamId, spotlightId, permission, orders }, ...
 * ]
 */
module.exports = (app) => {
  app.get('/bouffe/place/:place', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      const { place } = req.params;
      if (place.length < 2) return res.status(400).json({ error: 'NOT_A_PLACE' }).end();
      const letter = place.slice(0, 1);
      const number = place.slice(1, place.length);
      const user = await User.findOne({
        where: { placeNumber: number, tableLetter: letter },
      });
      if (!user) return res.status(404).json({ error: 'NOT_FOUND' }).end();

      return res
        .status(200)
        .json({ name: user.name, firstname: user.firstname })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
