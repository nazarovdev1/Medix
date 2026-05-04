'use strict';
const logger   = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const config   = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors     = err.errors     || [];

  // PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message    = 'Duplicate entry — resource already exists';
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message    = 'Referenced resource does not exist';
  }

  logger.error(message, {
    statusCode,
    method: req.method,
    path:   req.path,
    user:   req.user?.id,
    stack:  config.env === 'development' ? err.stack : undefined,
  });

  return res.status(statusCode).json({
    success:   false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
