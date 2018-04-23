const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

module.exports = () => (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ error: 'INVALID_FORM', details: errors.mapped() })
      .end()
  }

  req.body = matchedData(req)

  next()
}
