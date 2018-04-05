const pick = require('lodash.pick')

module.exports.outputFields = (user) => pick(user, [
  'id',
  'name',
  'email',
  'isAdmin',
  'paid',
  'shirt',
  'plusone',
  'ethernet',
  'accepted',
  'team'
])


module.exports.inputFields = (user) => pick(user, [
  'name',
  'email',
  'password'
])
