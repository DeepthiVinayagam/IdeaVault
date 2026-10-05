const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../../db');

/**
 * Middleware to authenticate requests via JWT cookie or Authorization header.
 */
function authenticateToken(req, res, next) {
  // Read token from httpOnly cookie or Authorization header
  let token = req.cookies ? req.cookies.token : null;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if user still exists in database
    const user = db.prepare('SELECT id, name, email, role, department FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

/**
 * Role-based authorization middleware factory.
 * Verifies that the authenticated user has one of the allowed roles.
 * 
 * @param  {...string} allowedRoles - e.g. requireRole('faculty', 'admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.` 
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
