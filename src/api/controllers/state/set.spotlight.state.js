const isRespo = require('../../middlewares/isRespo')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')

/**
 * GET /users
 *
 * Response:
 * [
 *    
 * ]
 */
module.exports = app => {
  app.put('/spotlights/:id/state', [isAuth(), isRespo()])
  app.put('/spotlights/:id/state', [
    check('value')
      .exists()
      .matches(/\d/),
    validateBody()
  ])
  app.put('/spotlights/:id/state', async (req, res) => {
    const { Spotlight } = req.app.locals.models

    try {
      const { value } = req.body
      const { id } = req.params
      let spotlight = await Spotlight.findById(id)
      if(!spotlight) return res.status(404).json({ error: 'NOT_FOUND' })
      spotlight.state = value
      await spotlight.save()
      
      return res
        .status(200)
        .json(spotlight)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
