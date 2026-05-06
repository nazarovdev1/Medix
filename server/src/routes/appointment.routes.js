'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/appointment.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Clinic appointments and services
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/',    authorize('admin','doctor'), validate(schema.list),     ctrl.getAll);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Appointment details
 */
router.get('/:id', authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getById);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Schedule a new appointment
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Appointment scheduled
 */
router.post('/',   authorize('admin','patient'), validate(schema.create), ctrl.create);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
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
router.patch('/:id/status', authorize('admin','doctor'), validate(schema.updateStatus), ctrl.updateStatus);

/**
 * @swagger
 * /appointments/{id}/services:
 *   post:
 *     summary: Add services to appointment
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Services added
 */
router.post('/:id/services', authorize('admin','doctor'), validate(schema.addServices), ctrl.addServices);

/**
 * @swagger
 * /appointments/{id}/services:
 *   get:
 *     summary: Get services for appointment
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/:id/services',  authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getServices);

/**
 * @swagger
 * /appointments/{id}/total-cost:
 *   get:
 *     summary: Get total cost of appointment
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Total cost
 */
router.get('/:id/total-cost', authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getTotalCost);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Appointment cancelled
 */
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
