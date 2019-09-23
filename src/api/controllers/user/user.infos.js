const log = require('../../utils/log')(module)
const jwt = require('jsonwebtoken')
const isAuth = require('../../middlewares/isAuth')
const env = require('../../../env')
const errorHandler = require('../../utils/errorHandler')
const { outputFields } = require('../../utils/publicFields')
const { isTournamentFull, remainingPlaces } = require('../../utils/isFull')
const isInTournament = require('../../utils/isInTournament')

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
    const { User, Tournament, Team, Order, Network } = req.app.locals.models

    try {
      let tournaments = await Tournament.findAll({
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


      tournaments = tournaments.map(tournament => {
        tournament = tournament.toJSON()

        tournament.isFull = isTournamentFull(tournament)

        tournament.remainingPlaces = remainingPlaces(tournament)

        return tournament
      })

      // Clean user team
      if (user.team && user.team.users.length > 0) {
        user.team.users = user.team.users.map(outputFields)
        user.team.isInTournament = await isInTournament(user.team.id, req)
        user.team.remainingPlaces = tournaments.find(tournament => tournament.id === user.team.tournament.id).remainingPlaces
      }

      // Select returned information about user
      let userData = {
        ...outputFields(user),
        team: user.team,
      }

      /*
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
            user = await User.findByPk(user.id, {
              include: [{
                model: Team,
                attributes: ['id'],
                include: [{
                  model: Tournament,
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
            let tournament = 'libre'
            let subnet = ''
            console.log(user.team ? `HAS TEAM${user.team.id}` : 'HAS NO TEAM')
            if(user.team) console.log(user.team.spotlight ? `HAS SPOTLIGHT ${user.team.spotlight.shortName}` : 'HAS NO SPOTLIGHT')
            if(user.team && user.team.spotlight) tournament = user.team.spotlight.shortName
            switch (tournament){
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
              await network.update({
                ip: finalip
              })
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
      }*/

      return res
        .status(200)
        .json({
          user: userData,
          token,
          tournaments,
          //hasChangedIp
        })
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}
