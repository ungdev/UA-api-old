const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const validateBody = require('../../middlewares/validateBody')
const isLoginEnabled = require('../../middlewares/isLoginEnabled')
const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const log = require('../../utils/log')(module)

/**
 * POST /user/login
 * {
 *    name: String
 *    password: String
 * }
 *
 * Response:
 * {
 *    user: User,
 *    token: String
 * }
 */
module.exports = app => {
  app.put('/user/login', [isLoginEnabled()])

  app.put('/user/login', [
    check('name')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ \-]+/i),
    check('password')
      .exists(),
    validateBody()
  ])

  app.put('/user/login', async (req, res) => {
    const { User, Permission, Network } = req.app.locals.models

    try {
      const username = req.body.name
      const password = req.body.password

      const user = await User.findOne({
        where: {
          [Op.or]: [{ name: username }, { email: username }]
        }
      })

      if (!user) {
        log.warn(`user ${username} couldn't be found`)

        return res
          .status(400)
          .json({ error: 'INVALID_USERNAME' })
          .end()
      }

      if (user.registerToken) {
        log.warn(`user ${username} tried to login before activating`)

        return res
          .status(400)
          .json({ error: 'USER_NOT_ACTIVATED' })
          .end()
      }

      const passwordMatches = await bcrypt.compare(password, user.password)

      if (!passwordMatches) {
        log.warn(`user ${username} password didn't match`)

        return res
          .status(400)
          .json({ error: 'INVALID_PASSWORD' })
          .end()
      }

      const token = jwt.sign({ id: user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      log.info(`user ${user.name} logged`)

      let permissions = await Permission.findOne({
        where: {
          userId: user.id
        }
      })

      if(!permissions) {
        log.info(`no permissions found for user ${user.name}`)
      }

      permissions = {
        admin: permissions.admin,
        respo: permissions.respo
      }

      let ip = req.headers['x-forwarded-for']
      if(ip) {
        ip = ip.split(',')[0]
        const ipTab = ip.split('.')
        
        if(ipTab[0] === '10') {
          let network = await Network.findOne({
            where: { ip }
          })

          if(network) {
            await user.addNetwork(network)
            log.info(`Added ip ${ip} to user ${user.name}.`)
          }
          else {
            log.info(`Could not add user ip, ${ip} does not exist.`)
          }
        }
      }

      res
        .status(200)
        .json({ user: outputFields(user), token, permissions })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
