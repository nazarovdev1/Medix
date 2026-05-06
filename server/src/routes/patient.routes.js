'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/patient.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/patient.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/',    authorize('admin', 'doctor', 'cashier'), validate(schema.list),     ctrl.getAll);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Patient details
 */
router.get('/:id', authorize('admin', 'doctor', 'patient', 'cashier'), validate(schema.uuidParam), ctrl.getById);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Patient created
 */
router.post('/',   authorize('admin', 'cashier'), validate(schema.create), ctrl.create);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Patient updated
 */
router.put('/:id', authorize('admin', 'doctor', 'cashier'), validate(schema.update), ctrl.update);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     tags: [Patients]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Patient deleted
 */
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
