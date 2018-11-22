const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
const errorHandler = require('../../utils/errorHandler')

/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {
  app.get('/network/:ip', async (req, res) => {
    const { Network, User } = req.app.locals.models
    const { ip } = req.params
    try {
      const nw = await Network.findOne({ where: { ip }, include: [User] })
      if(!nw || !nw.user) return res.status(404).end() // if nw not found, or nw has no user
      res.status(200).end() // everything's fine
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
