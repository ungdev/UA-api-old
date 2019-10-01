const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);


/**
 * PUT /users/:id
 * {
 *   username: String
 *   lastname: String
 *   firstname: String
 *   email: String
 *   (password): String,
 *   (oldPassword): String
 * }
 *
 * Response
 * {
 *
 * }
 */
module.exports = (app) => {
  app.put('/users/:id', [isAuth()]);

  app.put('/users/:id', [
    check('username')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]*$/i)
      .isLength({ min: 3, max: 100 }),
    check('lastname')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]*$/i)
      .isLength({ min: 2, max: 100 }),
    check('firstname')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]*$/i)
      .isLength({ min: 2, max: 100 }),
    check('oldpassword')
      .optional()
      .isLength({ min: 6 }),
    check('password')
      .optional()
      .isLength({ min: 6 }),
    check('email')
      .exists()
      .isEmail(),
    validateBody(),
  ]);

  app.put('/users/:id', async (req, res) => {
    try {
      // todo: refaire pour admins
      if (req.params.id !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

      if (req.body.password && req.body.oldpassword) {
        req.body.oldpassword = await bcrypt.hash(
          req.body.oldpassword,
          parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
        );

        const passwordMatches = bcrypt.compare(req.body.oldpassword, req.user.password);

        if (!passwordMatches) {
          return res
            .status(400)
            .json({ error: 'WRONG_PASSWORD' })
            .end();
        }

        req.body.password = await bcrypt.hash(
          req.body.password,
          parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
        );
      }

      const { firstname, lastname, username, password, email } = req.body;
      const userUpdated = {
        id: req.params.id,
        username,
        firstname,
        lastname,
        password,
        email,
      };

      await req.user.update(userUpdated);

      log.info(`user ${req.body.name} updated`);

      return res
        .status(200)
        .json(userUpdated)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
