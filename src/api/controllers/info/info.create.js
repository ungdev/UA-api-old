const errorHandler = require('../../utils/errorHandler')
const isAdmin = require('../../middlewares/isAdmin')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')


module.exports = app => {
  app.post('/infos/:id', [
    isAdmin(),
    check('title')
      .exists(),
    check('content')
      .exists(),
    validateBody()
  ])
  app.post('/infos/:id', async (req, res) => {
    const { Info } = req.app.locals.models

    try {
      const info = await Info.create({
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

