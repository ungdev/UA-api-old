const pick = (object, keys) => keys.reduce((obj, key) => {
  // eslint-disable-next-line no-prototype-builtins
  if (object && object.hasOwnProperty(key)) {
    obj[key] = object[key];
  }
  return obj;
}, {});

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
