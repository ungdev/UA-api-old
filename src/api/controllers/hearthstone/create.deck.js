const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')
const { check } = require('express-validator/check')
const validateBody = require('../../middlewares/validateBody')
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

  app.post('/hearthstone/decks', [isAuth()])
  app.post('/hearthstone/decks', [
    check('deckstring')
      .exists(),
    check('name')
      .exists(),
    validateBody()
  ])
  app.post('/hearthstone/decks', async (req, res) => {
    const { Deck } = req.app.locals.models
    const { user } = req
    let deck = ''
    try {
      deck = decode(req.body.deckstring) // test if we can decode
    } catch(err) {
      return res.status(500).json(err.message).end()
    }
    if (!user.team || !user.team.spotlight || user.team.spotlight.name !== 'Hearthstone') {
      return res.status(403).json({ error: 'NOT_IN_HS_TOURNAMENT' }).end()
    }
    let decks = await Deck.findAll({ where: { teamId: user.team.id } })
    const cla = cards.find(card => card.dbfId === deck.heroes[0]).cardClass
    if (deck.format !== 2) {
      return res.status(403).json({ error: 'WRONG_FORMAT' }).end()
    }
    if (decks.length === 4) {
      return res.status(403).json({ error: 'TOO_MANY_DECKS' }).end()
    }
    if (decks.find(de => de.class === cla)) {
      return res.status(403).json({ error: 'CLASS_ALREADY_EXIST' }).end()
    }
    if (decks.find(de => de.name === req.body.name)) {
      return res.status(403).json({ error: 'NAME_ALREADY_EXIST' }).end()
    }
    const d = await Deck.create({
      name: req.body.name,
      deckstring: req.body.deckstring,
      class: cla
    })
    await user.team.addDeck(d)

    const decoded = decode(d.deckstring)
    const deckcards = decoded.cards.map(card => {
      const infos = cards.find(c => c.dbfId === card[0])
      return {
        ...infos,
        quantity: card[1]
      }
    })
    const hero = cards.find(c => c.dbfId === decoded.heroes[0])
    try {
      return res
        .status(200)
        .end()
    } catch (err) {
      log.info(err)
      errorHandler(err, res)
    }
  })
}
