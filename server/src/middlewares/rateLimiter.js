'use strict';
const rateLimit = require('express-rate-limit');
const config    = require('../config');

const defaultLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success:    false,
    statusCode: 429,
    message:    'Too many requests, please try again later.',
  },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success:    false,
    statusCode: 429,
    message:    'Too many authentication attempts, please try again in 15 minutes.',
  },
});

module.exports = { defaultLimiter, authLimiter };
