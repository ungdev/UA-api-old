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

  app.get('/hearthstone/decks/:id', [isAuth()])
  app.get('/hearthstone/decks/:id', async (req, res) => {
    try {
      const { Deck } = req.app.locals.models
      const deck = await Deck.findById(req.params.id)
      if(!deck) return res.status('404').json({ error: 'NOT_FOUND' }).end()
      const decoded = decode(deck.deckstring)
      const deckcards = decoded.cards.map(card => {
        const infos = cards.find(c => c.dbfId === card[0])
        return {
          ...infos,
          quantity: card[1]
        }
      })
      const hero = cards.find(c => c.dbfId === decoded.heroes[0])
      return res
        .status(200)
        .json({
          id: deck.id,
          name: deck.name,
          cards: deckcards,
          hero,
          class: deck.class
        })
        .end()
    } catch (err) {
      log.info(err)
      errorHandler(err, res)
    }
  })
}
