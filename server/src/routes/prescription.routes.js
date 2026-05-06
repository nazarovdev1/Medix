'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/prescription.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/prescription.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Medication prescriptions
 */

/**
 * @swagger
 * /prescriptions/appointment/{appointmentId}:
 *   get:
 *     summary: Get prescriptions for an appointment
 *     tags: [Prescriptions]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
router.get('/appointment/:appointmentId', authorize('admin','doctor','patient'), validate(schema.apptIdParam), ctrl.getByAppointment);

/**
 * @swagger
 * /prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Prescription details
 */
router.get('/:id',    authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getById);

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Create new prescription
 *     tags: [Prescriptions]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Prescription created
 */
router.post('/',      authorize('admin','doctor'), validate(schema.create), ctrl.create);

/**
 * @swagger
 * /prescriptions/{id}:
 *   put:
 *     summary: Update prescription
 *     tags: [Prescriptions]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Prescription updated
 */
router.put('/:id',    authorize('admin','doctor'), validate(schema.update), ctrl.update);

/**
 * @swagger
 * /prescriptions/{id}:
 *   delete:
 *     summary: Delete prescription
 *     tags: [Prescriptions]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Prescription deleted
 */
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
