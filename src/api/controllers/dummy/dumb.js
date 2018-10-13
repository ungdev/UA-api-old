const errorHandler = require('../../utils/errorHandler')
const moment = require('moment')
const log = require('../../utils/log')(module)
/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {
  app.get('/pay/:name', async (req, res) => {
    try {
      log.info(req.params.name)
      const { User } = req.app.locals.models
      let user = await User.findOne({ where: { name: req.params.name } })
      log.info('ok')
      if(!user) return res.status(404).json('not found').end()
      user.paid = 1
      user.paid_at = moment().format()
      await user.save()
      return res
        .status(200)
        .json(user)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
