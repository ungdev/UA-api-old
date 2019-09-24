const { check } = require('express-validator/check');
const moment = require('moment');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isInTeam = require('../../middlewares/isInTeam');
const isCaptain = require('../../middlewares/isCaptain');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /team/:id/accept
 * {
 *   user: String
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/team/:id/accept', [
    isAuth('team-accept'),
    isInTeam('team-accept'),
    isCaptain('team-accept'),
  ]);

  app.post('/team/:id/accept', [
    check('user')
      .exists()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/team/:id/accept', async (req, res) => {
    try {
      const { User, Team, Spotlight } = req.app.locals.models;
      const user = await User.findByPk(req.body.user);
      const captain = await User.findByPk(req.user.id, {
        include: [
          {
            model: Team,
            attributes: ['id'],
            include: [
              {
                model: User,
                attributes: ['id'],
              },
              {
                model: Spotlight,
                attributes: ['perTeam'],
              },
            ],
          },
        ],
      });

      if (user.teamid) {
        log.warn(
          `user ${req.user.name} tried to accept ${user.name}, but he's in another team (${
            user.teamId
          })`,
        );

        return res
          .status(401)
          .json({ error: 'ALREADY_IN_TEAM' })
          .end();
      }

      if (
        captain.team && captain.team.spotlight && captain.team.users
        && captain.team.spotlight.perTeam <= captain.team.users.length
      ) {
        return res.status(400).json({ error: 'TEAM_FULL' });
      }

      await req.app.locals.models.AskingUser.destroy({
        where: {
          userId: user.id,
        },
      });

      await req.user.team.addUser(user);
      user.joined_at = moment().format();
      await user.save();

      log.info(`user ${req.user.name} accepted user ${user.name}`);

      return res
        .status(200)
        .json({})
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
