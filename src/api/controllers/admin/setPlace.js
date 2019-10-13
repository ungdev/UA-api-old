const hasPermission = require('../../middlewares/hasPermission');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * PUT /admin/setPlace/:id
 *
 * Response: none
 *
 */
module.exports = (app) => {
  app.put('/admin/setPlace/:id', [isAuth(), hasPermission('admin')]);

  app.put('/admin/setPlace/:id', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      const { placeLetter } = req.body;
      const { placeNumber } = req.body;

      if (placeLetter === null || placeNumber === null || placeLetter.length > 1) {
        return res
          .status(400) // Bad request
          .json({ error: 'BAD_REQUEST' })
          .end();
      }

      const user = await User.findByPk(req.params.id);
      await user.update({
        tableLetter: placeLetter || null,
        placeNumber: placeNumber || null,
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
