module.exports = () => (req, res, next) => {
  const { Team } = req.app.locals.models;
  const team = Team.findByPk(req.user.teamId, {
    where: {
      captainId: req.user.id,
    },
  });
  if (!team) {
    return res
      .status(401)
      .json({ error: 'NO_CAPTAIN' })
      .end();
  }

  return next();
};
