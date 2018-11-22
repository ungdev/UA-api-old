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

  app.delete('/hearthstone/decks/:id', [isAuth()])
  app.delete('/hearthstone/decks/:id', async (req, res) => {
    const { Deck } = req.app.locals.models
    const { user } = req

    try {
      let deck = await Deck.findById(req.params.id)
      if (!user.team || user.team.id !== deck.teamId) {
        return res
          .status(403)
          .json('UNAUTHORIZED')
          .end()
      }
      await deck.destroy()
      return res
        .status(200)
        .end()
    } catch (err) {
      log.info(err)
      errorHandler(err, res)
    }
  })
}
