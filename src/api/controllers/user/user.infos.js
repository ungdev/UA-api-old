const log = require('../../utils/log')(module)
const jwt = require('jsonwebtoken')
const isAuth = require('../../middlewares/isAuth')
const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const { isSpotlightFull } = require('../../utils/isFull')
const isInSpotlight = require('../../utils/isInSpotlight')

/**
 * GET /user
 *
 * Response:
 * {
 *    user: User
 *    token: String,
 *    spotlights: [Spotlight]
 *    teams: [Team]
 *    teamfinders: [Teamfinder],
 *    prices: Object
 * }
 */
module.exports = app => {
  app.get('/user', [isAuth()])

  app.get('/user', async (req, res) => {
    const { User, Permission, Spotlight, Team, Order, Network } = req.app.locals.models

    try {
      let spotlights = await Spotlight.findAll({
        include: [{
          model: Team,
          include: [User]
        }]
      })

      // Generate new token
      const token = jwt.sign({ id: req.user.id }, env.ARENA_API_SECRET, {
        expiresIn: env.ARENA_API_SECRET_EXPIRES
      })

      let user = req.user.toJSON()

      // Clean user team
      if (user.team && user.team.users.length > 0) {
        user.team.users = user.team.users.map(outputFields)
        user.team.isInSpotlight = await isInSpotlight(user.team.id, req)
      }

      spotlights = spotlights.map(spotlight => {
        spotlight = spotlight.toJSON()

        spotlight.isFull = isSpotlightFull(spotlight)

        return spotlight
      })

      // Get permission
      const permission = await Permission.findOne({
        where: { userId: user.id }
      })

      let permissionData = null

      if(permission) {
        permissionData = {
          admin: permission.admin,
          respo: permission.respo,
          permission: permission.permission
        }
      }
      else {
        log.info(`No permission found for user ${user.name}`)
      }

      // Select returned information about user
      let userData = {
        ...outputFields(user),
        permission: permissionData,
        orders: await Order.findAll({
          where: { userId: user.id }
        }),
        team: user.team,
        place: (user.tableLetter + user.placeNumber) || ''
      }


      // 
      let ip = req.headers['x-forwarded-for']
      let hasChangedIp = false
      if(ip) {
        ip = ip.split(',')[0]
        const ipTab = ip.split('.')
        
        if(ipTab[0] === '172' && ipTab[1] === '16' && (ipTab[2] === '98' || ipTab[2] === '99')) {
          let network = await Network.findOne({
            where: { ip }
          })

          if(network && (network.ip.startsWith('172.16.98.') || network.ip.startsWith('172.16.99.'))) { // if doesnt start with 172.16.98., it means that the ip has been set, but the pc has not updated his ip yet
            console.log('1')
            user = await User.findById(user.id, {
              include: [{
                model: Team,
                attributes: ['id'],
                include: [{
                  model: Spotlight,
                  attributes: ['id', 'shortName']
                }]
              }]
            })
            console.log('1,1')
            await network.setUser(user)
            console.log('2')
            log.info(`Added user ${user.name} to ip ${ip}.`)
            let allnetworks = await Network.findAll({ attributes: ['ip'] })
            console.log('2')
            let spotlight = 'libre'
            let subnet = ''
            console.log(user.team ? `HAS TEAM${user.team.id}` : 'HAS NO TEAM')
            if(user.team) console.log(user.team.spotlight ? `HAS SPOTLIGHT ${user.team.spotlight.shortName}` : 'HAS NO SPOTLIGHT')
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
              case 'Hearthstone':
                subnet = '172.16.53.'
                break
              case 'osu!':
                subnet = '172.16.52.'
                break
              case 'libre':
                subnet = '172.16.55.'
                break
              default:
                subnet = '172.16.55.' //poubelle dans le libre
                break
            }
            allnetworks = allnetworks.filter(nw => nw && nw.ip && nw.ip.startsWith(subnet))
            let allIp = allnetworks.map(nw => nw.ip.split('.')[3]).sort((a, b) => {
              if(parseInt(a, 10) > parseInt(b, 10)) return 1
              if(parseInt(a, 10) < parseInt(b, 10)) return -1
              return 0
            })
            console.log(allIp)
            let newIp = 1
            while(newIp === parseInt(allIp[newIp - 1], 10)) {
              newIp++
            }
            let finalip = `${subnet}${newIp}`
            let found = await Network.findOne({ where: {
              ip: finalip
            } })
            if (!found) {
              network.ip = finalip
              await network.save()
              log.info(`changed user ${user.name}'s ip to ${network.ip}.`)
              hasChangedIp = true
            } else {
              console.log('DUPLICATE IP')
            }
          }
          else {
            log.info(`Could not add user ip, ${ip} does not exist or ip has not updated yet`)
          }
        }
      }

      return res
        .status(200)
        .json({
          user: userData,
          token,
          spotlights,
          hasChangedIp,
          prices: {
            partners: env.ARENA_PRICES_PARTNER_MAILS,
            plusone: env.ARENA_PRICES_PLUSONE,
            partner: env.ARENA_PRICES_PARTNER,
            default: env.ARENA_PRICES_DEFAULT,
            ethernet: env.ARENA_PRICES_ETHERNET,
            ethernet7: env.ARENA_PRICES_ETHERNET7,
            shirt: env.ARENA_PRICES_SHIRT,
            laptop: env.ARENA_PRICES_LAPTOP,
            screen27: env.ARENA_PRICES_SCREEN27,
            kaliento: env.ARENA_PRICES_KALIENTO,
            mouse: env.ARENA_PRICES_MOUSE,
            headset: env.ARENA_PRICES_HEADSET,
            keyboard: env.ARENA_PRICES_KEYBOARD,
            chair: env.ARENA_PRICES_CHAIR,
            streamingPC: env.ARENA_PRICES_STREAMING_PC,
            gamingPC: env.ARENA_PRICES_GAMING_PC,
            screen24: env.ARENA_PRICES_SCREEN24,
            tombola: env.ARENA_PRICES_TOMBOLA,
          }
        })
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
