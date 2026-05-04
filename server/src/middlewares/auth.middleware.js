'use strict';
const jwt     = require('jsonwebtoken');
const config  = require('../config');
const ApiError = require('../utils/ApiError');
const { query } = require('../db/pool');

/**
 * Verify JWT access token and attach user to req.
 */
const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, config.jwt.accessSecret);

    // Confirm user still exists and is active
    const { rows } = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1 AND is_deleted = FALSE',
      [payload.sub]
    );
    if (!rows.length || !rows[0].is_active) {
      throw ApiError.unauthorized('User account disabled or not found');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(err);
  }
};

/**
 * Role-based access control factory.
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized`));
  }
  next();
};

module.exports = { authenticate, authorize };
