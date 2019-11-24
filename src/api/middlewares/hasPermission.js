module.exports = (permission) => (req, res, next) => {
  const { user } = req;

  if (user && user.permissions && (user.permissions === 'admin' || user.permissions === permission)) {
    return next();
  }

  return res
    .status(401)
    .json({ error: 'UNAUTHORIZED' })
    .end();
};