const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const { sendInfosMail } = require('../../utils/sendMailInfo')
const errorHandler = require('../../utils/errorHandler')
const log = require('../../utils/log')(module)

/**
 * put /users/id
 *
 * Response:
 * 
 */

module.exports = app => {
  

  app.get('/admin/informations-mail', [isAuth(), isAdmin()])
  app.get('/admin/informations-mail', async (req, res) => {
    const { User, Team, Spotlight } = req.app.locals.models

    try {
      let allPaidUsers = await User.findAll({ attributes: ['email', 'name', 'id'], where: { paid: 1 }, include: [{ model: Team, include: [Spotlight] }] })
      
      for(let user of allPaidUsers) {
        await sendInfosMail(user)
      }
      return res
        .status(200)
        .json(allPaidUsers)
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
