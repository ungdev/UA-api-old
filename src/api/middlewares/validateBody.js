const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

module.exports = () => (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ error: errors.mapped() })
      .end()
  }

  req.body = matchedData(req)

  next()
}
