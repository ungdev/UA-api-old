const { outputFields } = require('../../utils/publicFields');
const errorHandler = require('../../utils/errorHandler');
const hasPermission = require('../../middlewares/hasPermission');
const isAuth = require('../../middlewares/isAuth');

/**
 * PUT /admin/validate
 *
 * Response:
 * [
 *    { id, name, firstname, lastname, email, paid, teamId, spotlightId, permission, orders }, ...
 * ]
 */
module.exports = (app) => {
  app.put('/admin/validate', [isAuth(), hasPermission('validate')]);

  app.put('/admin/validate', async (req, res) => {
    const { User, Order, Team, Spotlight } = req.app.locals.models;

    try {
      if (!req.body.barcode && !req.body.name) return res.status(400).json({ error: 'MISSING_PARAMS' });
      let user = null;
      if (req.body.barcode) {
        const barcode = req.body.barcode.substr(0, req.body.barcode.length - 1);
        user = await User.findOne({
          where: { barcode },
          attributes: [
            'id',
            'barcode',
            'firstname',
            'lastname',
            'name',
            'paid',
            'placeNumber',
            'tableLetter',
            'plusone',
            'scanned',
          ],
          include: [
            {
              model: Order,
            },
            {
              model: Team,
              attributes: ['name'],
              include: [{ model: Spotlight, attributes: ['name'] }],
            },
          ],
        });
      }
      if (!user && req.body.name) {
        user = await User.findOne({
          where: { name: req.body.name },
          attributes: [
            'id',
            'barcode',
            'firstname',
            'lastname',
            'name',
            'paid',
            'placeNumber',
            'tableLetter',
            'plusone',
            'scanned',
          ],
          include: [
            {
              model: Order,
            },
            {
              model: Team,
              attributes: ['name'],
              include: [{ model: Spotlight, attributes: ['name'] }],
            },
          ],
        });
      }
      if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

      const { scanned } = user;

      user.scanned = true;
      await user.save();
      user.scanned = scanned;

      // Get place
      let place = '';

      if (user.tableLetter && user.placeNumber) {
        place = `${user.tableLetter}${user.placeNumber}`;
      }

      const team = user.teamId ? `${user.team.name}` : 'soloteam';

      const spotlight = user.team.spotlightId
        ? `${user.team.spotlight.name}`
        : 'Tournoi Libre';

      return res
        .status(200)
        .json({
          user: {
            ...outputFields(user),
            place,
            team,
            spotlight,
          },
        })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
