'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/patient.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/patient.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',    authorize('admin', 'doctor'), validate(schema.list),     ctrl.getAll);
router.get('/:id', authorize('admin', 'doctor', 'patient'), validate(schema.uuidParam), ctrl.getById);
router.post('/',   authorize('admin'), validate(schema.create), ctrl.create);
router.put('/:id', authorize('admin', 'doctor'), validate(schema.update), ctrl.update);
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
