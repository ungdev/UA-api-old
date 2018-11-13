const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require("sequelize")
const log = require("../../utils/log")(module)

module.exports = app => {
  app.post("/conversations", [isAuth()])
  app.post("/conversations", async (req, res) => {
    const { Conversations, User } = req.app.locals.models

    try {
      const user = await User.findById(req.user.id)
      const conversations = await Conversations.create({
        user1 : null,
        user2 : user.id
      })
      // await message.setFrom(user.isAdmin ? {id: '00000000-0000-0000-0000-000000000000', name: 'UTT Arena'} : req.user)
      // await message.setTo(req.user)
      return res
        .status(200)
        .json(conversations)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
