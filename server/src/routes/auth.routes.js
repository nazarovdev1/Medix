'use strict';
const router     = require('express').Router();
const ctrl       = require('../controllers/auth.controller');
const validate   = require('../middlewares/validate.middleware');
const schema     = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter }  = require('../middlewares/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/register', authLimiter, validate(schema.register), ctrl.register);
router.post('/login',    authLimiter, validate(schema.login),    ctrl.login);
router.post('/refresh',  authLimiter, validate(schema.refresh),  ctrl.refresh);
router.post('/logout',   authenticate, ctrl.logout);
router.get('/me',        authenticate, ctrl.me);

module.exports = router;
