'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/payment.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/payment.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',    authorize('admin'), validate(schema.list),      ctrl.getAll);
router.get('/:id', authorize('admin','doctor','patient'), validate(schema.uuidParam), ctrl.getById);
router.post('/',   authorize('admin'), validate(schema.create),    ctrl.create);
router.patch('/:id/status', authorize('admin'), validate(schema.updateStatus), ctrl.updateStatus);
router.delete('/:id', authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
