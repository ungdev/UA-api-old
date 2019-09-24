const pick = require('lodash.pick');

module.exports.outputFields = (user) => pick(user, [
  'id',
  'username',
  'firstname',
  'lastname',
  'email',
  'teamId',
  'scanned',
  'permissions',
  'place',
]);

module.exports.inputFields = (user) => pick(user, ['name', 'lastname', 'firstname', 'gender', 'email', 'password']);
