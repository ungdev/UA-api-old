const debug = require('debug')('arena.utt.fr-api:loginEnabled');


module.exports = () => async function (req, res, next) {
  if (process.env.ARENA_API_DISABLE_LOGIN === '1') {
    debug('user tried to login while it\'s disabled');

    return res
      .status(403)
      .json({ error: 'DISABLED_LOGIN' })
      .end();
  }

  return next();
};
