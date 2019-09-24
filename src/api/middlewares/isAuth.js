const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const log = require('../utils/log')(module);

jwt.verify = promisify(jwt.verify);

module.exports = (route) => async (req, res, next) => {
  const { User } = req.app.locals.models;

  const auth = req.get('X-Token');

  if (!auth || auth.length === 0) {
    log.warn('missing token', { route });

    return res
      .status(401)
      .json({ error: 'NO_TOKEN' })
      .end();
  }

  try {
    const decoded = await jwt.verify(auth, process.env.ARENA_API_SECRET);

    const user = await User.findByPk(decoded.id, {
      include:
      [
        // todo: decommenter ça
        /* {
          model: Team,
          include: [User, Spotlight]
        } */
      ],
    });

    req.user = user;

    next();
  }
  catch (err) {
    log.warn('invalid token', { route });

    return res
      .status(401)
      .json({ error: 'INVALID_TOKEN' })
      .end();
  }
};
