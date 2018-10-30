const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require("sequelize")
const log = require("../../utils/log")(module)

module.exports = app => {
  app.get("/messages", [isAuth()])
  app.get("/messages", async (req, res) => {
    const { Messages, User } = req.app.locals.models

    try {
      let messages = await Messages.findAll({
        order: [["createdAt", "ASC"]],
        where: {
          [Sequelize.Op.or]: [
            { senderId: req.user.id },
            { receiverId: req.user.id }
          ]
        },
        include: [
          {
            model: User, as: 'From'
          },
          {
            model: User, as: 'To'
          }
        ]
      })
      return res
        .status(200)
        .json(messages)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
