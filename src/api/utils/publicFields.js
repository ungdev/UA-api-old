const pick = require('lodash.pick')

module.exports.outputFields = user =>
  pick(user, [
    'id',
    'name',
    'lastname',
    'firstname',
    'gender',
    'email',
    'isAdmin',
    'paid',
    'shirt',
    'plusone',
    'ethernet',
    'accepted',
    'team',
    'respo'
  ])

module.exports.inputFields = user => pick(user, ['name', 'lastname', 'firstname', 'gender', 'email', 'password'])
