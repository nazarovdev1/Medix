'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/appointment.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',    authorize('admin','doctor'), validate(schema.list),     ctrl.getAll);
router.get('/:id', authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getById);
router.post('/',   authorize('admin','patient'), validate(schema.create), ctrl.create);

router.patch('/:id/status', authorize('admin','doctor'), validate(schema.updateStatus), ctrl.updateStatus);

router.post('/:id/services', authorize('admin','doctor'), validate(schema.addServices), ctrl.addServices);
router.get('/:id/services',  authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getServices);
router.get('/:id/total-cost', authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getTotalCost);

router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
