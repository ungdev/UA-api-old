const pick = require('lodash.pick')

module.exports.outputFields = user =>
  pick(user, [
    'id',
    'name',
    'lastname',
    'firstname',
    'gender',
    'email',
    'paid',
    'plusone',
    'teamId',
  ])

module.exports.inputFields = user => pick(user, ['name', 'lastname', 'firstname', 'gender', 'email', 'password'])
