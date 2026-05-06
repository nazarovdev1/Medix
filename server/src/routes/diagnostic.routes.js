'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/diagnostic.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/diagnostic.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Diagnostics
 *   description: Medical diagnostics and findings
 */

/**
 * @swagger
 * /diagnostics/appointment/{appointmentId}:
 *   get:
 *     summary: Get diagnostics for an appointment
 *     tags: [Diagnostics]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of diagnostics
 */
router.get('/appointment/:appointmentId', authorize('admin','doctor','patient'), validate(schema.apptIdParam), ctrl.getByAppointment);

/**
 * @swagger
 * /diagnostics/{id}:
 *   get:
 *     summary: Get diagnostic by ID
 *     tags: [Diagnostics]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Diagnostic details
 */
router.get('/:id',     authorize('admin','doctor'), validate(schema.uuidParam), ctrl.getById);

/**
 * @swagger
 * /diagnostics:
 *   post:
 *     summary: Create new diagnostic record
 *     tags: [Diagnostics]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Diagnostic created
 */
router.post('/',       authorize('admin','doctor'), validate(schema.create), ctrl.create);

/**
 * @swagger
 * /diagnostics/{id}:
 *   put:
 *     summary: Update diagnostic
 *     tags: [Diagnostics]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Diagnostic updated
 */
router.put('/:id',     authorize('admin','doctor'), validate(schema.update), ctrl.update);

/**
 * @swagger
 * /diagnostics/{id}:
 *   delete:
 *     summary: Delete diagnostic
 *     tags: [Diagnostics]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Diagnostic deleted
 */
router.delete('/:id',  authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
