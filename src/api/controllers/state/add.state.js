const isAdmin = require('../../middlewares/isAdmin')
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
  app.post('/states', [isAuth(), isAdmin()])
  app.post('/states', [
    check('title')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('desc')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('popover')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('spotlightId')
      .exists()
      .matches(/\d/),
    validateBody()
  ])
  app.post('/states', async (req, res) => {
    const { State, Spotlight } = req.app.locals.models

    try {
      const { title, desc, popover, spotlightId } = req.body
      let spotlight = await Spotlight.findById(spotlightId)
      if(!spotlight) return res.status(404).json({ error: 'NOT_FOUND' }).end()
      let state = await State.create({
        title,
        desc,
        popover
      })
      await spotlight.addState(state)
      await state.save()
      await spotlight.save()
      
      return res
        .status(200)
        .json(state)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
