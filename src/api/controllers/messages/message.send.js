const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require("sequelize")
const log = require("../../utils/log")(module)

module.exports = app => {
  app.post("/messages", [isAuth()])
  app.post("/messages", async (req, res) => {
    const { Messages, User } = req.app.locals.models

    try {
      const user = await User.findById(req.user.id)
      const message = await Messages.create({
        message: req.message
      })
      await message.setFrom(req.user)
      await message.setTo(req.user)
      return res
        .status(200)
        .json(message)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
