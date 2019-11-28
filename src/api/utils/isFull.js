const { Op } = require('sequelize');

const isUserTournamentFull = async (id, userModel, teamModel, tournamentModel, cartItemModel, cartModel) => {
  const includeCart = {
    model: cartItemModel,
    as: 'forUser',
    attributes: [],
    where: {
      itemId: 1,
    },
    include: [
      {
        model: cartModel,
        as: 'cart',
        attributes: [],
        where: {
          transactionState: {
            [Op.in]: ['paid', 'draft'],
          },
        },
      },
    ],
  };
  const forUser = await userModel.findByPk(id, {
    include: [
      {
        model: teamModel,
        include: [
          {
            model: tournamentModel,
            attributes: ['playersPerTeam', 'maxPlayers'],
            include: [
              {
                model: teamModel,
                attributes: ['id'],
                include: {
                  model: userModel,
                  attributes: ['id'],
                  include: [includeCart],
                },
              },
            ],
          },
        ],
      },
    ],
  });
  const fullTeams = forUser.team.tournament.teams.filter((team) => team.users.length === forUser.team.tournament.playersPerTeam);
  const maxTeams = forUser.team.tournament.maxPlayers / forUser.team.tournament.playersPerTeam;
  return fullTeams.length > maxTeams;
};

const isTournamentFull = async (id, userModel, teamModel, tournamentModel, cartItemModel, cartModel) => {
  const includeCart = {
    model: cartItemModel,
    as: 'forUser',
    attributes: [],
    where: {
      itemId: 1,
    },
    include: [
      {
        model: cartModel,
        as: 'cart',
        attributes: [],
        where: {
          transactionState: {
            [Op.in]: ['paid', 'draft'],
          },
        },
      },
    ],
  };
  const tournament = await tournamentModel.findByPk(
    id,
    {
      attributes: ['playersPerTeam', 'maxPlayers'],
      include: [
        {
          model: teamModel,
          attributes: ['id'],
          include: {
            model: userModel,
            attributes: ['id'],
            include: [includeCart],
          },
        },
      ],
    },
  );
  const fullTeams = tournament.teams.filter((team) => team.users.length === tournament.playersPerTeam);
  const maxTeams = tournament.maxPlayers / tournament.playersPerTeam;
  return [fullTeams.length >= maxTeams, tournament];
};

module.exports = { isUserTournamentFull, isTournamentFull };
