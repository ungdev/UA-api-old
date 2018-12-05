const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const log = require('../utils/log')(module)

jwt.verify = promisify(jwt.verify)

module.exports = route => async (req, res, next) => {
  let authorized = false

  if(req.user && req.user.permission) {
    if(req.user.permission.admin || req.user.permission.respo || req.user.permission.permission) {
      authorized = true
    }
  }
  
  if(authorized) {
    next()
  }
  else {
    return res
      .status(401)
      .json({ error: 'UNAUTHORIZED' })
      .end()
  }
}
