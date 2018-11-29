const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')

module.exports = app => {
  app.get('/conversations', [isAuth()])
  app.get('/conversations', async (req, res) => {
    const {
      Conversation,
      User,
      Team,
      Spotlight,
      Permission,
      Message
    } = req.app.locals.models
    const user = await User.findById(req.user.id, {
      include: [Permission]
    })

    if (!user)
      return res
        .status(404)
        .json('NOT_FOUND')
        .end()
    if (!user.permission.admin)
      return res
        .status(401)
        .json('NOT_ALLOWED')
        .end()

    if (user && user.permission && user.permission.admin) {
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
            },
            {
              model: Message,
              limit: 1,
              order: [['createdAt', 'DESC']]
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
