const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const isAdmin = authorizeRole('admin');
const isUser = authorizeRole('user', 'admin');

module.exports = {
  authorizeRole,
  isAdmin,
  isUser
};
