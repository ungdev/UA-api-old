const isAuth = require('../../middlewares/isAuth')
const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')


/**
 * PUT /admin/renameUser/:id
 * {
 *   name
 *   firstname
 *   lastname
 * }
 * Response: none
 *
 */
module.exports = app => {
  app.put('/admin/renameUser/:id', [isAuth(), isAdmin()])

  app.put('/admin/renameUser/:id', [
    check('name')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ \-]+/i)
      .isLength({ min: 3, max: 90 }),
    check('lastname')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ \-]+/i)
      .isLength({ min: 2, max: 200 }),
    check('firstname')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ \-]+/i)
      .isLength({ min: 2, max: 200 }),
    validateBody()
  ])

  app.put('/admin/renameUser/:id', async (req, res) => {
    const { User } = req.app.locals.models

    try {

      let user = await User.findByPk(req.params.id)
      await user.update({
        name: req.body.name,
        firstname: req.body.firstname,
        lastname: req.body.lastname
      })

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
