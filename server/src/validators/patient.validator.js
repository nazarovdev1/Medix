'use strict';
const Joi = require('joi');

const uuidParam = { params: Joi.object({ id: Joi.string().uuid().required() }) };

const create = {
  body: Joi.object({
    first_name:        Joi.string().max(100).required(),
    last_name:         Joi.string().max(100).required(),
    date_of_birth:     Joi.date().iso().max('now').required(),
    gender:            Joi.string().valid('male', 'female', 'other').required(),
    phone:             Joi.string().max(20).optional().allow(null, ''),
    email:             Joi.string().email().optional().allow(null, ''),
    address:           Joi.string().optional().allow(null, ''),
    emergency_contact: Joi.string().optional().allow(null, ''),
    insurance_id:      Joi.string().max(100).optional().allow(null, ''),
    blood_type:        Joi.string().valid('A+','A-','B+','B-','AB+','AB-','O+','O-').optional().allow(null),
    user_id:           Joi.string().uuid().optional().allow(null),
  }),
};

const update = { ...uuidParam, body: create.body.fork(Object.keys(create.body.describe().keys), f => f.optional()) };

const list = {
  query: Joi.object({
    page:    Joi.number().integer().min(1).default(1),
    limit:   Joi.number().integer().min(1).max(100).default(20),
    search:  Joi.string().optional().allow(''),
    sortBy:  Joi.string().valid('last_name','created_at','date_of_birth').default('created_at'),
    sortDir: Joi.string().valid('asc','desc').default('desc'),
  }),
};

module.exports = { create, update, list, uuidParam };
