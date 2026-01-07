const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization header format' });
  }

  const token = parts[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.secretOrKey);
    req.user = decoded;
    // Ensure type is set (default to 'user' for backward compatibility)
    if (!req.user.type) {
      req.user.type = 'user';
    }
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
