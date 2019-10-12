module.exports = () => async (req, res, next) => {
  const { Team } = req.app.locals.models;
  const team = await Team.count({
    where: {
      captainId: req.user.id,
      id: req.params.id,
    },
  });
  if (!team) {
    return res
      .status(401)
      .json({ error: 'NO_CAPTAIN' })
      .end();
  }
  req.team = team;
  return next();
};
