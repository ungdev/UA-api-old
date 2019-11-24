module.exports = (Team) => {
  let teams = [
    {
      id: '49ee896a-6ff2-4324-b3b7-c3454ca32e37',
      name: 'La Team des Winners',
      tournamentId: 1,
      captainId: '48fe6584-a118-4f85-8b6a-f2f26a153801',
    }, {
      id: '49ee896a-6ff2-4324-b3b7-c3454ca32e38',
      name: 'La Team des Loosers',
      tournamentId: 3,
      captainId: '48fe6584-a118-4f85-8b6a-f2f26a153807',
    }];

  teams = teams.map((team) => ({
    ...team,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return Team.bulkCreate(teams);
}