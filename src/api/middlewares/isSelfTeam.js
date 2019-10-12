module.exports = () => async (req, res, next) => {
  if (req.user.team.id !== req.params.id) {
    return res
      .status(403)
      .json({ error: 'UNAUTHORIZED' })
      .end();
  }

  return next();
};
