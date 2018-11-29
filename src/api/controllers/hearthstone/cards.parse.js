const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)
const { cards } = require('./cardsV27641')

/**
 * GET /hearthstone/cards
 *
 * Response:
 * 
 */
module.exports = app => {
  app.get('/hearthstone/cards', [isAuth(), isAdmin()])
  
  app.get('/hearthstone/cards', async (req, res) => {
    let formatedCards = []
    for(let i = 0; i < cards.length; i++){
      let card = cards[i]
      formatedCards.push({
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        cost: card.cost,
        dbfId: card.dbfId,
        cardClass: card.cardClass
      })
    }
    try {
      return res
        .status(200)
        .json(formatedCards)
        //.json(decode(req.body.deckstring))
        .end()
    } catch (err) {
      log.info(err)
      errorHandler(err, res)
    }
  })
}
