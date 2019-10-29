const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

const CheckValidate = [check('slug').isUUID(), validateBody()];

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
const ValidateAccount = (userModel, teamModel) => {
  return async (req, res) => {
    const { slug } = req.body;

    try {
      const user = await userModel.findOne({
        where: { registerToken: slug },
        include: {
          model: teamModel,
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
        .json({
          user: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            team: user.team,
            type: user.type,
            isPaid: false,
          },
          token,
        })
        .end();
    } catch (err) {
      return errorHandler(err, res);
    }
  };
};

module.exports = { ValidateAccount, CheckValidate };
