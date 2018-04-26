const pick = require('lodash.pick')

module.exports.outputFields = user =>
  pick(user, [
    'id',
    'name',
    'fullname',
    'email',
    'isAdmin',
    'paid',
    'shirt',
    'plusone',
    'ethernet',
    'accepted',
    'team'
  ])

module.exports.inputFields = user => pick(user, ['name', 'fullname', 'email', 'password'])
