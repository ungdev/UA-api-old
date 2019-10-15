module.exports = (permission) => (req, res, next) => {
  const { user } = req;
  let authorized = false;

  if (user && user.permissions) {
    const userPermissions = user.permissions.split(',');

    if (userPermissions.include('admin')) {
      // Admin has all permissions
      authorized = true;
    }

    if (userPermissions.includes(permission)) {
      authorized = true;
    }
  }

  if (!authorized) {
    return res
      .status(401)
      .json({ error: 'UNAUTHORIZED' })
      .end();
  }

  return next();
};