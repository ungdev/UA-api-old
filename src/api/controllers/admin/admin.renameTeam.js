const isAuth = require('../../middlewares/isAuth')
const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')


/**
 * PUT /admin/renameTeam/:id
 * {
 *   name
 * }
 * Response: none
 *
 */
module.exports = app => {
  app.put('/admin/renameTeam/:id', [isAuth(), isAdmin()])

  app.put('/admin/renameTeam/:id', [
      check('name')
        .exists()
        .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    validateBody()
  ])

  app.put('/admin/renameTeam/:id', async (req, res) => {
    const { Team } = req.app.locals.models

    try {

      let team = await Team.findByPk(req.params.id)
      team.name = req.body.name

      await team.save()

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
