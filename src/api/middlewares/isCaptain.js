module.exports = () => async (req, res, next) => {
  const { Team } = req.app.locals.models;
  const userTeam = await Team.findByPk(req.user.teamId);

  if (!userTeam // if user has no team
    || req.params.teamId !== req.user.id // or param teamId doesn't match its teamId
    || userTeam.captainId !== req.user.id // or he is not captain
  ) {
    return res
      .status(401)
      .json({ error: 'NO_CAPTAIN' })
      .end();
  }

  return next();
};
