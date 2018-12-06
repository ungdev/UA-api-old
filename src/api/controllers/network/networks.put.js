const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')

/**
 * put /networks/@mac
 *
 * Response:
 * 
 */
module.exports = app => {
  app.put('/networks/:mac', [
    check('switchId')
      .exists(),
    check('switchPort')
      .exists(),
    validateBody()
  ])
  app.put('/networks/:mac', async (req, res) => {
    const { Network } = req.app.locals.models
    const { mac } = req.params
    const { switchId, switchPort } = req.body
    try {
      const nw = await Network.findOne({ where: { mac } })
      if(!nw) return res.status(404).end()
      nw.switchId = switchId
      nw.switchPort = switchPort
      await nw.save()
      res
        .status(200)
        .end() // everything's fine
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
