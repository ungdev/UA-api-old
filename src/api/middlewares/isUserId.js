const jwt = require('jsonwebtoken');
const { promisify } = require('util');

jwt.verify = promisify(jwt.verify);

module.exports = () => async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: 'UNAUTHORIZED' })
      .end();
  }

  if (req.user.id !== req.params.id) {
    return res
      .status(403)
      .json({ error: 'UNAUTHORIZED' })
      .end();
  }

  return next();
};