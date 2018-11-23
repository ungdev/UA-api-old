const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
const errorHandler = require('../../utils/errorHandler')

/**
 * POST /network
 *
 * Response:
 * 
 */
module.exports = app => {
  app.post('/network', [
    check('mac')
      .exists(),
    check('ip')
      .exists(),
    check('switchId')
      .exists(),
    check('switchPort')
      .exists(),
    validateBody()
  ])

  app.post('/network', async (req, res) => {
    const { Network } = req.app.locals.models
    const { mac, ip, switchId, switchPort } = req.body
    try {
      const nw = await Network.create({ mac, ip, switchId, switchPort })
      return res
        .status(200)
        .json(nw)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
