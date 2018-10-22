const errorHandler = require("../../utils/errorHandler")
const isAuth = require("../../middlewares/isAuth")
const Sequelize = require('sequelize')
const log = require ('../../utils/log')(module)


module.exports = app => {
  app.get("/messages", [isAuth()])
  app.get("/messages", async (req, res) => {
    const { Messages } = req.app.locals.models

    try {
      let messages = await Messages.findAll({
        order: [["createdAt", "ASC"]],
        where: {
          [Sequelize.Op.or]: [{ from: req.user.id }, { to: req.user.id }]
        }
      })
      log.info(`messages : `, messages)
      return res
        .status(200)
        .json(messages)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
