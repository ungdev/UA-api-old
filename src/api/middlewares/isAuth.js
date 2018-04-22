const jwt = require('jsonwebtoken')
const pick = require('lodash.pick')
const bcrypt = require('bcryptjs')
const debug = require('debug')('arena.utt.fr-api:isAuth')
const { promisify } = require('util')
const env = require('../../env')

jwt.verify = promisify(jwt.verify)

module.exports = route => async (req, res, next) => {
  const { User, Team, Spotlight } = req.app.locals.models

  const auth = req.get('X-Token')

  if (!auth || auth.length === 0) {
    debug(`${route} failed : not connected`)

    return res
      .status(401)
      .json({ error: 'NO_TOKEN' })
      .end()
  }

  try {
    const decoded = await jwt.verify(auth, env.ARENA_API_SECRET)

    const user = await User.findById(decoded.id, {
      include: [
        {
          model: Team,
          include: [User, Spotlight]
        }
      ]
    })

    req.user = user

    next()
  } catch (err) {
    debug(`${route} failed : invalid token`)

    return res
      .status(401)
      .json({ error: 'INVALID_TOKEN' })
      .end()
  }
}
