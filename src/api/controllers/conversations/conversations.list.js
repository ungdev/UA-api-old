const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const isAdmin = require('../../middlewares/isAdmin')
const log = require('../../utils/log')(module)

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
    if (!user.permission)
      return res
        .status(401)
        .json('NOT_ALLOWED')
        .end()

    // If user is admin, display all convers
    if (user && user.permission && user.permission.admin) {
      try {
        let conversations = await Conversation.findAll({
          order: [['createdAt', 'ASC']],
          attributes: ['user1', 'user2'],
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
    } else {
      permissions = user.permission.respo.split(',').map(Number)
      conversations = await Conversation.findAll({
        order: [['createdAt', 'ASC']],
        attributes: ['user1', 'user2'],
        where: {
          user1: null,
          spotlightId: permissions
        },
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
        ]
      })
      return res
        .status(200)
        .json(conversations)
        .end()
    }
  })
}
