const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')


module.exports = app => {
  app.post('/infos/:id', [
    isAuth(),
    check('title')
      .exists(),
    check('content')
      .exists(),
    validateBody()
  ])
  app.post('/infos/:id', async (req, res) => {
    const { Info } = req.app.locals.models

    try {
      if(!req.body.title || !req.body.content || !req.params.id)
        return res.status(400).json('Missing params').end()

      const info = Info.create({
        title: req.body.title,
        content: req.body.content,
        spotlightId: req.params.id
      })
      return res
        .status(200)
        .json(info)
        .end()
      
    } catch (err) {
      errorHandler(err, res)
    }
  })
}

