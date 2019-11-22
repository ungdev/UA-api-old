const { check } = require('express-validator');

const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

const CheckUpdateUser = [
  check('permissions')
    .optional()
    .isString(),
  check('place')
    .optional()
    .isString(),
  validateBody(),
];

/**
 * Allow to edit an item inside a created cart.
 * Setting quantity to 0 is equivalent to delete the item from the cart.
 * PUT /admin/users/:userId
 * {
 *  place: string, optionnal
 *  permissions: string, optionnal
 * }
 * Response
 * {
 *
 * }
 * @param {object}  userModel the model to query for user
 * @param {string} userIdString the id name for user to look for in the route parameter
 */
const UpdateUser = (userModel, userIdString) => async (req, res) => {
  const userId = req.params[userIdString];
  const { place, permissions } = req.body;
  try {
    const user = await userModel.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }

    user.place = place || user.place;
    user.permissions = permissions !== 'none' && permissions || user.permissions;
    await user.save();

    return res.status(204).end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { UpdateUser, CheckUpdateUser };
