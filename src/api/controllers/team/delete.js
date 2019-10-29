const errorHandler = require('../../utils/errorHandler');

/**
 * Delete a team
 *
 * DELETE /teams/:id
 *
 * Response:
 * @param {string} teamIdString the name of the id to look for in the route parameter
 */
const Delete = () => async (req, res) => {
  try {
    req.user.type = 'none';
    await req.user.save();
    await req.user.team.destroy();
    return res.status(204).end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = Delete;
