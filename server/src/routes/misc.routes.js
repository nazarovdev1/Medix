'use strict';
const router  = require('express').Router();
const db      = require('../db/pool');
const ApiResponse  = require('../utils/ApiResponse');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const serviceRepo = require('../repositories/service.repository');
const deptRepo    = require('../repositories/department.repository');
const Joi = require('joi');
const validate = require('../middlewares/validate.middleware');

// ─── Services ─────────────────────────────────────────────
const serviceSchema = {
  body: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().optional().allow(null,''),
    base_cost: Joi.number().min(0).required(),
    department: Joi.string().max(150).optional().allow(null,''),
  }),
};
const uuidParam = { params: Joi.object({ id: Joi.string().uuid().required() }) };

router.get('/services', async (req, res, next) => {
  try {
    const meta = { limit: Math.min(parseInt(req.query.limit,10)||20, 100), offset: (parseInt(req.query.page,10)-1||0)*20 };
    const { rows, total } = await serviceRepo.findAll({ ...meta, search: req.query.search, sortBy: 'name', sortDir: 'ASC' });
    return res.json(new ApiResponse(200, rows, 'Services retrieved', { total }));
  } catch(err) { next(err); }
});

router.post('/services', authenticate, authorize('admin'), validate(serviceSchema), async (req, res, next) => {
  try {
    const svc = await serviceRepo.create(req.body);
    return res.status(201).json(new ApiResponse(201, svc, 'Service created'));
  } catch(err) { next(err); }
});

router.put('/services/:id', authenticate, authorize('admin'), validate({ ...uuidParam, body: serviceSchema.body }), async (req, res, next) => {
  try {
    const svc = await serviceRepo.update(req.params.id, req.body);
    return res.json(new ApiResponse(200, svc, 'Service updated'));
  } catch(err) { next(err); }
});

router.delete('/services/:id', authenticate, authorize('admin'), validate(uuidParam), async (req, res, next) => {
  try {
    await serviceRepo.softDelete(req.params.id);
    return res.json(new ApiResponse(200, null, 'Service deleted'));
  } catch(err) { next(err); }
});

// ─── Departments ──────────────────────────────────────────
const deptSchema = {
  body: Joi.object({
    name: Joi.string().max(150).required(),
    description: Joi.string().optional().allow(null,''),
  }),
};

router.get('/departments', async (req, res, next) => {
  try {
    const depts = await deptRepo.findAll();
    return res.json(new ApiResponse(200, depts));
  } catch(err) { next(err); }
});

router.post('/departments', authenticate, authorize('admin'), validate(deptSchema), async (req, res, next) => {
  try {
    const dept = await deptRepo.create(req.body);
    return res.status(201).json(new ApiResponse(201, dept, 'Department created'));
  } catch(err) { next(err); }
});

router.put('/departments/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const dept = await deptRepo.update(req.params.id, req.body);
    return res.json(new ApiResponse(200, dept, 'Department updated'));
  } catch(err) { next(err); }
});

router.delete('/departments/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await deptRepo.softDelete(req.params.id);
    return res.json(new ApiResponse(200, null, 'Department deleted'));
  } catch(err) { next(err); }
});

// ─── Audit Logs ───────────────────────────────────────────
router.get('/audit-logs', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      `SELECT al.*, u.email AS changed_by_email
       FROM audit_logs al
       LEFT JOIN users u ON al.changed_by = u.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.json(new ApiResponse(200, rows));
  } catch(err) { next(err); }
});

// ─── Health Check ─────────────────────────────────────────
router.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    return res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

module.exports = router;
