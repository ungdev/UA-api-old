const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const Sequelize = require('sequelize')
const log = require('../../utils/log')(module)

module.exports = app => {
  app.get('/conversations', [isAuth()])
  app.get('/conversations', async (req, res) => {
    const { Conversation, User, Team, Spotlight, Permission } = req.app.locals.models
    const user = await User.findById(req.user.id, {
      include: [Permission]
    })

    if (user.permission.admin === 100) {
      try {
        let conversations = await Conversation.findAll({
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'User2',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Team,
                  attributes: ['spotlightId'],
                  include: [
                    {
                      model: Spotlight,
                      attributes: ['name']
                    }
                  ]
                }
              ]
            }
          ],
          where: {
            user1: null
          }
        })

        return res
          .status(200)
          .json(conversations)
          .end()
      } catch (err) {
        errorHandler(err, res)
      }
    }
  })
}
