const { check } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const env = require('../../../env')
const log = require('../../utils/log')(module)
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const validateBody = require('../../middlewares/validateBody')
const isLoginEnabled = require('../../middlewares/isLoginEnabled')

/**
 * PUT /user/login
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
    const { User, Network } = req.app.locals.models

    try {
      const username = req.body.name
      const password = req.body.password

      // Get user
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

      // Check for password
      const passwordMatches = await bcrypt.compare(password, user.password)

      if (!passwordMatches) {
        log.warn(`user ${username} password didn't match`)

        return res
          .status(400)
          .json({ error: 'INVALID_PASSWORD' })
          .end()
      }

      // Check if account is activated
      if (user.registerToken) {
        log.warn(`user ${username} tried to login before activating`)

        return res
          .status(400)
          .json({ error: 'USER_NOT_ACTIVATED' })
          .end()
      }

      // Generate new token
      const token = jwt.sign({ id: user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      // 
      let ip = req.headers['x-forwarded-for']
      if(ip) {
        ip = ip.split(',')[0]
        const ipTab = ip.split('.')
        
        if(ipTab[0] === '172' && ipTab[1] === '16' && (ipTab[2] === '98' || ipTab[2] === '99')) {
          let network = await Network.findOne({
            where: { ip }
          })

          if(network && network.ip.startsWith('172.16.98.')) { // if doesnt start with 172.16.98., it means that the ip has been set, but the pc has not updated his ip yet
            await user.addNetwork(network)
            log.info(`Added user ${user.name} to ip ${ip}.`)
            let allnetworks = await Network.findAll({ attributes: ['ip'] })
            console.log('ALLIP')
            console.log(allip)
            let spotlight = 'libre'
            let subnet = ''
            if(user.team && user.team.spotlight) spotlight = user.team.spotlight.shortName
            switch (spotlight){
              case 'LoL (pro)':
                subnet = '172.16.51.'
                break
              case 'LoL (amateur)':
                subnet = '172.16.51.'
                break
              case 'Fortnite':
                subnet = '172.16.54.'
                break
              case 'CS:GO':
                subnet = '172.16.50.'
                break
              case 'HS':
                subnet = '172.16.53.'
                break
              case 'osu!':
                subnet = '172.16.52.'
                break
              case 'libre':
                subnet = '172.16.55.'
                break
              default:
                subnet = '172.16.98.' //poubelle
                break
            }
            allnetworks = allnetworks.filter(nw => nw.ip.startsWith(subnet)).sort((a, b) => {
              const ip1 = a.ip.split('.')[3]
              const ip2 = b.ip.split('.')[3]
              if(ip1 > ip2) return 1
              if(ip1 < ip2) return -1
              return 0
            })
            let allIp = allnetworks.map(nw => nw.ip.split('.')[3])
            let newIp = 1
            while(newIp === parseInt(allIp[newIp - 1], 10)) {
              newIp++
            }
            network.ip = `${subnet}${newIp}`
            await network.save()
            log.info(`changed user ${user.name}'s ip to ${newIp}.`)
          }
          else {
            log.info(`Could not add user ip, ${ip} does not exist or ip has not updated yet`)
          }
        }
      }

      log.info(`user ${user.name} logged`)

      res
        .status(200)
        .json({ user: outputFields(user), token })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
