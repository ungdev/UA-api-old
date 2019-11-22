const { col, Op } = require('sequelize');
const { check } = require('express-validator');
const errorHandler = require('../../utils/errorHandler');
const { includePay, includeCart } = require('../../utils/customIncludes');
const validateBody = require('../../middlewares/validateBody');

const CheckList = [
  check('status').isIn(['all', 'player', 'visitor', 'orga']).optional(),
  check('payment').isIn(['all','paid','noPaid']).optional(),
  check('scan').isIn(['all', 'true', 'false']).optional(),
  check('tournamentId').optional(),
  check('page').isInt().optional(),
  validateBody(),
];

/**
 * GET /admin/users
 * {
 *
 * }
 * Response
 * {
 *   Users
 * }
 * @param {object} infoModel model to query Infos
 * @param {object} teamModel model to query Infos
 * @param {object} tournamentModel model to query Infos
 */
const List = (userModel, teamModel, tournamentModel, cartModel, cartItemModel, itemModel) => async (req, res) => {
  const page = req.query.page || 0;
  const pageSize = 25;
  const offset = page * pageSize;
  const limit = pageSize;
  const filterTournament = req.query.tournamentId === 'all' ? undefined : req.query.tournamentId;

  const customWhere = [];
  if(req.query.status !== undefined && req.query.status !== 'all') {
    if(req.query.status === 'orga') {
      customWhere.push({ permissions: { [Op.not]: null } });
    }
    else {
      customWhere.push({
        [Op.and]: [{
          permissions: { [Op.is]: null },
        },
        {
          type: req.query.status,
        }],
      });
    }
  }
  if(req.query.scan !== undefined && req.query.scan !== 'all' && req.query.payment === 'paid') {
    customWhere.push({ scanned: req.query.scan === 'true' ? 1 : 0 });
  }

  try {
    const includeTeam = {
      model: teamModel,
      attributes: ['name'],
      where: filterTournament && {
        tournamentId: filterTournament,
      },
      include: {
        model: tournamentModel,
        attributes: ['shortName'],
      },
    };

    let { rows: users } = await userModel.findAndCountAll({
      subQuery: false,
      where: customWhere,
      attributes: [
        'id',
        'email',
        'username',
        'firstname',
        'lastname',
        'place',
        'permissions',
        'type',
        'scanned'
      ],
      include: [
        includeTeam,
        includeCart(cartModel, cartItemModel, itemModel, userModel),
        includePay(cartItemModel, cartModel, userModel),
      ],
      order: [filterTournament ? [col('team.name'),'ASC'] : ['username', 'ASC']],
      limit,
      offset,
    });

    // Filter by payment
    if(req.query.payment && req.query.payment !== 'all') {
      users = users.filter((user) => req.query.payment === 'paid' ? user.forUser.length > 0 : user.forUser.length === 0);
    }

    const formatUsers = users.map((user) => ({
      ...user.toJSON(),
      isPaid: user.forUser.length,
    }));

    return res
      .status(200)
      .json({
        users: formatUsers,
        pageSize,
        offset,
        limit,
        total: users.length,
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = { List, CheckList };
