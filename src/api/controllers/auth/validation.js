const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /auth/validation
 * {
 *   slug: UUID
 * }
 * Response
 * {
 *    User,
 *    Token: String
 * }
 */
module.exports = (app) => {
  app.post('/auth/validate', [
    check('slug')
      .isUUID(),
    validateBody(),
  ]);

  app.post('/auth/validate', async (req, res) => {
    const { User, Team } = req.app.locals.models;
    const { slug } = req.body;

    try {
      const user = await User.findOne({
        where: { registerToken: slug },
        include: {
          model: Team,
          attributes: ['id', 'name'],
        },
      });

      if (!user) {
        log.warn(`can not validate ${slug}, user not found`);

        return res
          .status(400)
          .json({ error: 'INVALID_TOKEN' })
          .end();
      }

      await user.update({
        registerToken: null,
      });

      log.info(`user ${user.username} was validated`);

      const token = jwt.sign({ id: user.id }, process.env.ARENA_API_SECRET, {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      });

      log.info(`user ${user.username} logged`);


      return res
        .status(200)
        .json(
          {
            user: {
              id: user.id,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              team: user.team,
            },
            token,
          },
        )
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
