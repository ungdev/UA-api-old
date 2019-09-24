const { check } = require('express-validator/check');
const moment = require('moment');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isNotInTeam = require('../../middlewares/isNotInTeam');
const { isTournamentFull } = require('../../utils/isFull');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /team
 * {
 *    name: String
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 */
module.exports = (app) => {
  app.post('/team', [isAuth('team-create'), isNotInTeam('team-create')]);

  app.post('/team', [
    check('name')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('spotlight')
      .exists()
      .matches(/\d/),
    validateBody(),
  ]);

  app.post('/team', async (req, res) => {
    const { Spotlight, Team, User } = req.app.locals.models;

    try {
      const spotlight = await Spotlight.findByPk(req.body.spotlight, {
        include: [
          {
            model: Team,
            include: [User],
          },
        ],
      });

      if (isTournamentFull(spotlight)) {
        return res
          .status(400)
          .json({ error: 'SPOTLIGHT_FULL' })
          .end();
      }

      const team = await Team.create({
        name: req.body.name,
        spotlightId: req.body.spotlight,
        captainId: req.user.id,
      });

      await req.user.setTeam(team);
      req.user.joined_at = moment().format();
      await req.user.save();

      log.info(`user ${req.user.name} created team ${req.body.name}`);

      return res
        .status(200)
        .json({ team })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
