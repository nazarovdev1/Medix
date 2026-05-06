'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/doctor.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/doctor.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor profiles and schedules
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/',    validate(schema.list),     ctrl.getAll);     // Public

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Doctor details
 */
router.get('/:id', validate(schema.uuidParam), ctrl.getById);   // Public

/**
 * @swagger
 * /doctors/{id}/schedule:
 *   get:
 *     summary: Get doctor schedule
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Doctor schedule
 */
router.get('/:id/schedule', validate(schema.uuidParam), ctrl.getSchedule); // Public

router.use(authenticate);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create doctor profile
 *     tags: [Doctors]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Doctor created
 */
router.post('/',    authorize('admin'), validate(schema.create), ctrl.create);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor
 *     tags: [Doctors]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Doctor updated
 */
router.put('/:id',  authorize('admin'), validate(schema.update), ctrl.update);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Doctors]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Doctor deleted
 */
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
