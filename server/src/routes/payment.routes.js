'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/payment.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/payment.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Financial transactions
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/',    authorize('admin','doctor','cashier'), validate(schema.list),      ctrl.getAll);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Payment details
 */
router.get('/:id', authorize('admin','doctor','patient','cashier'), validate(schema.uuidParam), ctrl.getById);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a new payment
 *     tags: [Payments]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Payment recorded
 */
router.post('/',   authorize('admin','cashier'), validate(schema.create),    ctrl.create);

/**
 * @swagger
 * /payments/{id}/status:
 *   patch:
 *     summary: Update payment status
 *     tags: [Payments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authorize('admin','cashier'), validate(schema.updateStatus), ctrl.updateStatus);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete payment record
 *     tags: [Payments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Payment deleted
 */
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
