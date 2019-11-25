const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log.js')(module);
const hasCartPaid = require('../../utils/hasCartPaid');

const CheckEdit = [
  check('username').isLength({ min: 3, max: 100 }),
  check('lastname').isLength({ min: 2, max: 100 }),
  check('firstname').isLength({ min: 2, max: 100 }),
  check('type')
    .optional(),
  check('oldpassword')
    .optional()
    .isLength({ min: 6 }),
  check('password')
    .optional()
    .isLength({ min: 6 }),
  validateBody(),
];

/**
 * Edit the user's info
 *
 * PUT /users/:id
 * {
 *   firstname: String
 *   lastname: String
 *   username: String
 *   (password): String,
 *   (oldPassword): String
 * }
 * Response
 * {
 *
 * }
 *
 * @param {string} userIdString the name of the user id in the route parameter
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Edit = (userIdString, cartModel, cartItemModel) => async (req, res) => {
  const userId = req.params[userIdString];
  try {
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }

    // Check if user want to change its password
    let password = null;
    if (req.body.password && req.body.oldpassword) {
      const passwordMatches = await bcrypt.compare(
        req.body.oldpassword,
        req.user.password,
      );

      if (!passwordMatches) {
        return res
          .status(400)
          .json({ error: 'WRONG_PASSWORD' })
          .end();
      }

      password = await bcrypt.hash(
        req.body.password,
        parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
      );
    }

    const { firstname, lastname, username } = req.body;

    let { type } = req.user;

    if (req.body.type) {
      const isPaid = await hasCartPaid(req.user, cartModel, cartItemModel);

      if (!isPaid) {
        // Allow to change type only if user has not paid
        type = req.body.type;
      }
      else {
        return res
          .status(400)
          .json({ error: 'CANNOT_CHANGE' })
          .end();
      }
    }

    const userUpdated = {
      id: userId,
      username,
      firstname,
      lastname,
      type,
      email: req.user.email,
      askingTeamId:
          req.body.type === 'visitor' && req.user.askingTeamId
            ? null
            : req.user.askingTeamId,
    };

    if(password !== null) {
      userUpdated.password = password;
    }

    await req.user.update(userUpdated);

    log.info(`user ${req.user.username} updated`);

    return res
      .status(200)
      .json(userUpdated)
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { Edit, CheckEdit };
