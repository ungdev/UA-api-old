const log = require('../utils/log')(module);

module.exports = (err, res) => {
  log.debug(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res
      .status(400)
      .json({ error: 'DUPLICATE_ENTRY' })
      .end();
  }

  return res
    .status(500)
    .json({ error: 'UNKNOWN' })
    .end();
};
