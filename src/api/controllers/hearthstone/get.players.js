const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)
const { decode } = require('deckstrings')
const { cards } = require('./cardsV27641')

/**
 * put /hearthstone/deck
 *
 * Response:
 * 
 */
module.exports = app => {

  app.get('/hearthstone/players', [isAuth()])
  app.get('/hearthstone/players', async (req, res) => {
    try {
      const { Team, User, Deck } = req.app.locals.models
      const teams = await Team.findAll({ where: { spotlightId: 5 }, include: [User, Deck] })
      let players = teams.filter(team => team.users[0].paid).map(team => {
        let user = team.users[0]
        user.decks = team.decks.map(deck => {
          const decoded = decode(deck.deckstring)
          return {
            id: deck.id,
            name: deck.name,
            class: deck.class,
            hero: decoded.heroes[0]
          }
        })
        return user
      })
      return res
        .status(200)
        .json(players.map(player => {
          return {
            id: player.id,
            name: player.name,
            decks: player.decks,
          }
        }))
        .end()
    } catch (err) {
      log.info(err)
      errorHandler(err, res)
    }
  })
}
