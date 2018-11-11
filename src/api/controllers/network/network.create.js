const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const sendPdf = require('../../utils/sendPDF')
const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
const log = require('../../utils/log')(module)
const moment = require('moment')

/**
 * put /users/id
 *
 * Response:
 * 
 */
module.exports = app => {

  app.post('/network', [isAuth()])
  app.post('/network', async (req, res) => {
    //const { User, Network } = req.app.locals.models
    try {
      
      return res
        .status(200)
        .json({ ip1: req.headers['x-forwarded-for'], ip2: req.connection.remoteAddress })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
