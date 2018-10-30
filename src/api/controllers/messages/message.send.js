const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require("sequelize")
const log = require("../../utils/log")(module)

module.exports = app => {
  app.post("/messages", [isAuth()])
  app.post("/messages", async (req, res) => {
    const { Messages, User } = req.app.locals.models

    try {
      const message = await Messages.create({
        message: 'message'
      })
      await message.setFrom(req.user)
      await message.setTo(req.user)
      const prout = await User.findById(req.user.id)
      log.info(prout.isAdmin)
      return res
        .status(200)
        .json(message)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
