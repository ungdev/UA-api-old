const { validationResult, matchedData } = require('express-validator');

const log = require('../utils/log.js')(module);

module.exports = () => (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    log.info('INVALID_FORM :', errors.mapped());
    return res
      .status(400)
      .json({ error: 'INVALID_FORM', details: errors.mapped() })
      .end();
  }

  req.body = matchedData(req);

  return next();
};
