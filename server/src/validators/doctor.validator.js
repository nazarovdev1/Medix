'use strict';
const Joi = require('joi');

const uuidParam = { params: Joi.object({ id: Joi.string().uuid().required() }) };

const create = {
  body: Joi.object({
    first_name:    Joi.string().max(100).required(),
    last_name:     Joi.string().max(100).required(),
    speciality:    Joi.string().max(150).required(),
    email:         Joi.string().email().required(),
    license_no:    Joi.string().max(100).required(),
    schedule_id:   Joi.string().uuid().optional().allow(null),
    department_id: Joi.string().uuid().optional().allow(null),
    user_id:       Joi.string().uuid().optional().allow(null),
  }),
};

const update = { ...uuidParam, body: create.body.fork(Object.keys(create.body.describe().keys), f => f.optional()) };

const list = {
  query: Joi.object({
    page:          Joi.number().integer().min(1).default(1),
    limit:         Joi.number().integer().min(1).max(100).default(20),
    search:        Joi.string().optional().allow(''),
    speciality:    Joi.string().optional().allow(''),
    department_id: Joi.string().uuid().optional(),
    sortBy:        Joi.string().valid('last_name','created_at','speciality').default('created_at'),
    sortDir:       Joi.string().valid('asc','desc').default('desc'),
  }),
};

module.exports = { create, update, list, uuidParam };
