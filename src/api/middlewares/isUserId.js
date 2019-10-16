module.exports = () => (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return res
      .status(403)
      .json({ error: 'UNAUTHORIZED' })
      .end();
  }

  return next();
};