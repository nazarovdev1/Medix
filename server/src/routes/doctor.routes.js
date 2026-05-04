'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/doctor.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/doctor.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/',    validate(schema.list),     ctrl.getAll);     // Public
router.get('/:id', validate(schema.uuidParam), ctrl.getById);   // Public
router.get('/:id/schedule', validate(schema.uuidParam), ctrl.getSchedule); // Public

router.use(authenticate);
router.post('/',    authorize('admin'), validate(schema.create), ctrl.create);
router.put('/:id',  authorize('admin'), validate(schema.update), ctrl.update);
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
