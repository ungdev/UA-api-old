const jwt = require('jsonwebtoken');
const { promisify } = require('util');

jwt.verify = promisify(jwt.verify);

module.exports = (type) => async (req, res, next) => {
  let authorized = false;

  if (req.user.type === type) {
    authorized = true;
  }

  if (authorized) {
    return next();
  }

  return res
    .status(401)
    .json({ error: 'UNAUTHORIZED' })
    .end();
};
