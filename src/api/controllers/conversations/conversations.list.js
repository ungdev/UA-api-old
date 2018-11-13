const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require("sequelize")
const log = require("../../utils/log")(module)

module.exports = app => {
  app.get("/conversations", [isAuth()])
  app.get("/conversations", async (req, res) => {
    const { Conversations, User } = req.app.locals.models

    try {
      let conversations = await Conversations.findAll({
        order: [["createdAt", "ASC"]],
        where: {
          [Sequelize.Op.or]: [
            { user1: req.user.id },
            { user2: req.user.id }
          ]
        },
        include: [
          {
            model: User, as: 'User1'
          },
          {
            model: User, as: 'User2'
          }
        ]
      })
      log.info('CONVERS MA DJEUL', conversations)
      return res
        .status(200)
        .json(conversations)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
