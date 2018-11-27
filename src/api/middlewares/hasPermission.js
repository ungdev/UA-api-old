const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const log = require('../utils/log')(module)

jwt.verify = promisify(jwt.verify)

// Usage example (check if user can send messages in spotlight "libre" (#7)):
//     hasPermission('sendMessages.7')

module.exports = route => async (req, res, next) => {
  let authorized = false

  if(req.user && req.user.permission) {
    if(req.user.permission.admin) {
      authorized = true
    }
    else if(req.user.permission.respo && req.user.permission.respo.includes(route)) {
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
