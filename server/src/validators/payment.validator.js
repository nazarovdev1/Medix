'use strict';
const Joi = require('joi');

const uuidParam = { params: Joi.object({ id: Joi.string().uuid().required() }) };

const create = {
  body: Joi.object({
    appointment_id: Joi.string().uuid().required(),
    payment_method: Joi.string().valid('cash','card','insurance','online','other').required(),
    notes:          Joi.string().optional().allow(null, ''),
  }),
};

const updateStatus = {
  params: Joi.object({ id: Joi.string().uuid().required() }),
  body: Joi.object({
    status: Joi.string().valid('pending','paid','partial','refunded','failed').required(),
  }),
};

const list = {
  query: Joi.object({
    page:    Joi.number().integer().min(1).default(1),
    limit:   Joi.number().integer().min(1).max(100).default(20),
    status:  Joi.string().valid('pending','paid','partial','refunded','failed').optional(),
    sortBy:  Joi.string().valid('payment_date','amount','created_at').default('payment_date'),
    sortDir: Joi.string().valid('asc','desc').default('desc'),
  }),
};

module.exports = { create, updateStatus, list, uuidParam };
