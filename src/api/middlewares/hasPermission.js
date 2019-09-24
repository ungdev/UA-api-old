const jwt = require('jsonwebtoken');
const { promisify } = require('util');

jwt.verify = promisify(jwt.verify);

module.exports = (route) => async (req, res, next) => {
  let authorized = false;

  if (req.user && req.user.permission) {
    if (req.user.permission.admin) {
      authorized = true;
    }
    else if (req.user.permission.permission && req.user.permission.permission.includes(route)) {
      authorized = true;
    }
  }

  if (authorized) return next();

  return res
    .status(401)
    .json({ error: 'UNAUTHORIZED' })
    .end();
};
