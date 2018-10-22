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
    'plusone',
    'team',
    'respo',
    'orders',
  ])

module.exports.inputFields = user => pick(user, ['name', 'lastname', 'firstname', 'gender', 'email', 'password'])
