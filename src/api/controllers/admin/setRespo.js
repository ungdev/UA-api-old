const isAdmin = require('../../middlewares/isAdmin');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * PUT /admin/setRespo/:id
 *
 * Response: none
 *
 */
module.exports = (app) => {
  app.put('/admin/setRespo/:id', [isAuth(), isAdmin()]);

  app.put('/admin/setRespo/:id', async (req, res) => {
    const { Permission } = req.app.locals.models;

    try {
      if (req.body.respo === null) {
        return res
          .status(400) // Bad request
          .json({ error: 'BAD_REQUEST' })
          .end();
      }

      let permission = await Permission.findOne({
        where: { userId: req.params.id },
      });

      if (permission) {
        await permission.update({
          respo: req.body.respo.toString(),
        });
      }
      else {
        permission = await Permission.create({
          userId: req.params.id,
          respo: req.body.respo.toString(),
        });
      }

      // Destroy row if user has no permissions
      if ((!permission.admin || permission.admin === 0) && !permission.respo && !permission.permission) {
        permission.destroy();
      }

      return res.status(200).end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
