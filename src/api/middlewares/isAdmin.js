const jwt = require('jsonwebtoken');
const { promisify } = require('util');

jwt.verify = promisify(jwt.verify);

module.exports = () => async (req, res, next) => {
  if (req.user && req.user.permission && req.user.permission.admin) return next();

  return res
    .status(401)
    .json({ error: 'NOT_ADMIN' })
    .end();
};
