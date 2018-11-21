const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const { sendReminderToUnpaidUsers, sendReminderToNotInTeamUsers, sendReminderToNotFullTeamUsers } = require('../../utils/sendReminder')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * put /users/id
 *
 * Response:
 * 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(() => {
    log.info('resolved !')
    resolve()
  }, ms))
}

module.exports = app => {
  

  app.get('/admin/reminders', [isAuth(), isAdmin()])
  app.get('/admin/reminders', async (req, res) => {
    const { User, Team, Spotlight } = req.app.locals.models

    try {
      let unpaidUsers = await User.findAll({ where: { paid: 0, registerToken: null } })
      for(let user of unpaidUsers) {
        await sendReminderToUnpaidUsers(user)
      }
      let notInTeamPaidUsers = await User.findAll({ where: { paid: 1, teamId: null, registerToken: null } })
      for(let user of notInTeamPaidUsers) {
        await sendReminderToNotInTeamUsers(user)
      }
      let inNotFullTeamUsers = await User.findAll({
        where: {
          paid: 1,
          registerToken: null
        },
        include: [{ model: Team, include: [Spotlight, User] }]
      })
      //return res.status(200).json(inNotFullTeamUsers).end()
      inNotFullTeamUsers = inNotFullTeamUsers.filter(user => {
        if (!user.team) return false
        return user.team.spotlight.perTeam !== user.team.users.length
      })
      for(let user of inNotFullTeamUsers) {
        await sendReminderToNotFullTeamUsers(user)
      }

      return res
        .status(200)
        .json({
          unpaidUsers: unpaidUsers.map(user => user.name),
          notInTeamPaidUsers : notInTeamPaidUsers.map(user => user.name),
          inNotFullTeamUsers: inNotFullTeamUsers.map(user => user.name),
        })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
