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
    'tombola',
    'kaliento',
    'mouse',
    'keyboard',
    'headset',
    'screen24',
    'screen27',
    'chair',
    'gamingPC',
    'streamingPC',
    'laptop',
    'accepted',
    'team'
  ])

module.exports.inputFields = user => pick(user, ['name', 'lastname', 'firstname', 'gender', 'email', 'password'])
