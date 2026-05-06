'use strict';
const router     = require('express').Router();
const ctrl       = require('../controllers/auth.controller');
const validate   = require('../middlewares/validate.middleware');
const schema     = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');
// rate limiter disabled

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', validate(schema.register), ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login',    validate(schema.login),    ctrl.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh',  validate(schema.refresh),  ctrl.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout',   authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me',        authenticate, ctrl.me);

module.exports = router;
