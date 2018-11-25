const fs = require('fs')
const path = require('path')
const log = require('./log')(module)
const env = require('../../env')
const mustache = require('mustache')

const transporter = require('nodemailer').createTransport(env.ARENA_MAIL_SMTP)



const infosHTML = fs.readFileSync(path.join(__dirname, 'infos_joueur.html')).toString()


module.exports = {
  sendInfosMail: async (user) => {
    
    log.info(`[mail infos] sending mail to ${user.email}`)
    mustache.parse(infosHTML)
    return transporter.sendMail({
        from: '"UTT Arena" <arena@utt.fr>',
        to: user.email,
        subject: `UTT Arena 2018 - Informations essentielles`,
        html: mustache.render(infosHTML, {
          lol: user.team && user.team.spotlight && 
          (user.team.spotlight.shortName === 'LoL (pro)' || user.team.spotlight.shortName === 'LoL (amateur)'),
          fortnite: user.team && user.team.spotlight && 
          user.team.spotlight.shortName === 'Fortnite',
          csgo: user.team && user.team.spotlight && 
          user.team.spotlight.shortName === 'CS:GO',
          hs: user.team && user.team.spotlight && 
          user.team.spotlight.shortName === 'Hearthstone',
          ssbu: user.team && user.team.spotlight && 
          user.team.spotlight.shortName === 'SSBU',
          osu: user.team && user.team.spotlight && 
          user.team.spotlight.shortName === 'osu!',
          libre: true,
        }),
    })
  },
}