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

  app.get('/hearthstone/decks', [isAuth()])
  app.get('/hearthstone/decks', async (req, res) => {
    try {
      const { Deck } = req.app.locals.models
      const { user } = req
      if (!user.team || !user.team.spotlight || user.team.spotlight.name !== 'Hearthstone') {
        return res
          .status(404)
          .json({ error: 'NOT_IN_HS_TOURNAMENT' })
          .end()
      }
      const decks = await Deck.findAll({ where: { teamId: user.team.id } })
      return res
        .status(200)
        .json(decks.map(deck => {
          const decoded = decode(deck.deckstring)
          const deckCards = decoded.cards.map(card => {
            const infos = cards.find(c => c.dbfId === card[0])
            return {
              ...infos,
              quantity: card[1]
            }
          })
          return {
            id: deck.id,
            name: deck.name,
            cards: deckCards,
            hero: decoded.heroes[0],
            class: deck.class
          }
        }))
        .end()
    } catch (err) {
      log.info(err)
      errorHandler(err, res)
    }
  })
}
