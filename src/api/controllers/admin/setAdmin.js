const isAdmin = require('../../middlewares/isAdmin');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * PUT /admin/setAdmin/:id
 *
 * Response: none
 *
 */
module.exports = (app) => {
  app.put('/admin/setAdmin/:id', [isAuth(), isAdmin()]);

  app.put('/admin/setAdmin/:id', async (req, res) => {
    const { Permission } = req.app.locals.models;

    try {
      if (req.body.admin === null) {
        return res
          .status(400) // Bad request
          .json({ error: 'BAD_REQUEST' })
          .end();
      }
      if (req.params.id === req.user.id) {
        return res
          .status(403) // Forbidden
          .json({ error: 'NOT_ALLOWED' })
          .end();
      }

      let permission = await Permission.find({
        where: { userId: req.params.id },
      });

      if (permission) {
        permission.admin = req.body.admin;
        await permission.save();
      }
      else {
        permission = await Permission.create({
          userId: req.params.id,
          admin: req.body.admin,
          respo: null,
        });
      }

      if ((!permission.admin || permission.admin === 0) && !permission.respo) {
        permission.destroy();
      }

      return res
        .status(200)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
