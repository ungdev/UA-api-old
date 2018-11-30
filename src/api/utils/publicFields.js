const pick = require('lodash.pick')

module.exports.outputFields = user =>
  pick(user, [
    'id',
    'name',
    'firstname',
    'lastname',
    'gender',
    'email',
    'paid',
    'plusone',
    'teamId',
    'tableLetter',
    'placeNumber'
  ])

module.exports.inputFields = user => pick(user, ['name', 'lastname', 'firstname', 'gender', 'email', 'password'])
