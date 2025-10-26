const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireMFA = async (req, res, next) => {
  if (!req.user.mfaEnabled) {
    return next();
  }

  const mfaToken = req.headers['x-mfa-token'];
  if (!mfaToken) {
    return res.status(401).json({ message: 'MFA token required' });
  }

  const { verifyMFAToken } = require('../utils/mfa');
  const isValid = verifyMFAToken(req.user.mfaSecret, mfaToken);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid MFA token' });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireMFA
};
