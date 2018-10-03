const jwt = require('jsonwebtoken')
const { promisify } = require('util')

jwt.verify = promisify(jwt.verify)

module.exports = route => async (req, res, next) => {
  if(req.user && req.user.isAdmin === 100) next()
  else return res
    .status(401)
    .json({ error: 'NOT_ADMIN' })
    .end()
}
