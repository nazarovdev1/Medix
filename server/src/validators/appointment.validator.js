'use strict';
const Joi = require('joi');

const uuidParam = { params: Joi.object({ id: Joi.string().uuid().required() }) };

const create = {
  body: Joi.object({
    patient_id: Joi.string().uuid().required(),
    doctor_id:  Joi.string().uuid().required(),
    appt_date:  Joi.date().iso().min('now').required(),
    appt_time:  Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    reason:     Joi.string().max(500).optional().allow(null, ''),
    notes:      Joi.string().max(1000).optional().allow(null, ''),
  }),
};

const updateStatus = {
  params: Joi.object({ id: Joi.string().uuid().required() }),
  body: Joi.object({
    status: Joi.string().valid('scheduled','confirmed','in_progress','completed','cancelled','no_show').required(),
    notes:  Joi.string().optional().allow(null, ''),
  }),
};

const addServices = {
  params: Joi.object({ id: Joi.string().uuid().required() }),
  body: Joi.object({
    services: Joi.array().items(
      Joi.object({
        service_id:  Joi.string().uuid().required(),
        quantity:    Joi.number().integer().min(1).default(1),
        discount_pct: Joi.number().min(0).max(100).default(0),
      })
    ).min(1).required(),
  }),
};

const list = {
  query: Joi.object({
    page:       Joi.number().integer().min(1).default(1),
    limit:      Joi.number().integer().min(1).max(100).default(20),
    status:     Joi.string().valid('scheduled','confirmed','in_progress','completed','cancelled','no_show').optional(),
    doctor_id:  Joi.string().uuid().optional(),
    patient_id: Joi.string().uuid().optional(),
    date_from:  Joi.date().iso().optional(),
    date_to:    Joi.date().iso().optional(),
    sortBy:     Joi.string().valid('appt_date','created_at','status').default('appt_date'),
    sortDir:    Joi.string().valid('asc','desc').default('asc'),
  }),
};

module.exports = { create, updateStatus, addServices, list, uuidParam };
