const isAuth = require('../../middlewares/isAuth')
const { outputFields } = require('../../utils/publicFields')
const { isTournamentFull, isTeamFull } = require('../../utils/isFull')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * POST /spotlight/:id/join
 * {
 *
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 */
module.exports = app => {
  app.post('/spotlight/:id/join', [isAuth('spotlight-join')])

  app.post('/spotlight/:id/join', async (req, res) => {
    const { Team, User, Spotlight, AskingUser } = req.app.locals.models

    try {
      const spotlight = await Spotlight.findByPk(req.params.id, {
        include: [
          {
            model: Team,
            include: [User]
          }
        ]
      })

      // spotlight is full
      if (isTournamentFull(spotlight)) {
        log.warn(`user ${req.user.name} tried to join ${spotlight.name}, but it's full`)

        return res
          .status(401)
          .json({ error: 'SPOTLIGHT_FULL' })
          .end()
      }

      const requireTeam = spotlight.perTeam > 1
      const withoutTeam = !req.user.team || req.user.team.soloTeam

      // spotlight needs team and user has no team
      if (requireTeam && withoutTeam) {
        log.warn(`user ${req.user.name} tried to join ${spotlight.name} without a team`)

        return res
          .status(401)
          .json({ error: 'NO_TEAM' })
          .end()
      }

      // spotlight needs team and user is not a captain
      if (requireTeam && !withoutTeam && !req.user.isCaptain(req.user.team)) {
        log.warn(`user ${req.user.name} tried to join ${spotlight.name} without being captain`)

        return res
          .status(401)
          .json({ error: 'NO_CAPTAIN' })
          .end()
      }

      // User hasnt pay. Must be after TEAM_NOT_FULL as error will be different
      // We don't want a captain having NOT_PAID error
      if (!req.user.paid) {
        log.warn(`user ${req.user.name} tried to join a single spotlight without having paid`)

        return res
          .status(401)
          .json({ error: 'NOT_PAID' })
          .end()
      }

      // spotlight needs team and team not full/paid
      if (requireTeam && !withoutTeam && !isTeamFull(req.user.team, spotlight.perTeam, true)) {
        log.warn(`user ${req.user.name} tried to join ${spotlight.name} without a full team`)

        return res
          .status(401)
          .json({ error: 'TEAM_NOT_FULL' })
          .end()
      }

      let team = null

      if (!req.user.team) {
        team = await Team.create({
          name: `${req.user.name}-solo-team`,
          captainId: req.user.id,
          soloTeam: true
        })

        await req.user.setTeam(team)

        await AskingUser.destroy({
          where: {
            userId: req.user.id
          }
        })

        log.info(`user ${req.user.name} created self-team for ${spotlight.name}`)
      } else {
        team = req.user.team
      }

      await team.setSpotlight(req.params.id)

      // add || [ req.user ] because only a team created line 91 would have no users key
      team.users = (team.users || [ req.user ]).map(outputFields)

      log.info(`team ${team.name} joined ${spotlight.name}`)

      return res
        .status(200)
        .json({ team })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
