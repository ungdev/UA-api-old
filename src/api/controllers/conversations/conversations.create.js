const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require("sequelize")
const log = require("../../utils/log")(module)

module.exports = app => {
  app.post("/conversations", [isAuth()])
  app.post("/conversations", async (req, res) => {
    const { Conversation } = req.app.locals.models

    try {
      const conversations = await Conversation.create({
        user1 : null,
        user2 : req.user.id
      })
      return res
        .status(200)
        .json(conversations)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
