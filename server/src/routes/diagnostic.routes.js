'use strict';
const router   = require('express').Router();
const ctrl     = require('../controllers/diagnostic.controller');
const validate = require('../middlewares/validate.middleware');
const schema   = require('../validators/diagnostic.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/appointment/:appointmentId', authorize('admin','doctor','patient'), validate(schema.apptIdParam), ctrl.getByAppointment);
router.get('/:id',     authorize('admin','doctor'), validate(schema.uuidParam), ctrl.getById);
router.post('/',       authorize('admin','doctor'), validate(schema.create), ctrl.create);
router.put('/:id',     authorize('admin','doctor'), validate(schema.update), ctrl.update);
router.delete('/:id',  authorize('admin'), validate(schema.uuidParam), ctrl.delete);

module.exports = router;
