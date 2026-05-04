'use strict';
const Joi = require('joi');

const uuidParam    = { params: Joi.object({ id: Joi.string().uuid().required() }) };
const apptIdParam  = { params: Joi.object({ appointmentId: Joi.string().uuid().required() }) };

const create = {
  body: Joi.object({
    appointment_id:  Joi.string().uuid().required(),
    medication_name: Joi.string().max(200).required(),
    dosage:          Joi.string().max(100).required(),
    frequency:       Joi.string().max(150).required(),
    duration_days:   Joi.number().integer().min(1).required(),
    pharmacy:        Joi.string().max(200).optional().allow(null, ''),
    notes:           Joi.string().optional().allow(null, ''),
  }),
};

const update = {
  params: Joi.object({ id: Joi.string().uuid().required() }),
  body: create.body.fork(Object.keys(create.body.describe().keys), f => f.optional()),
};

module.exports = { create, update, uuidParam, apptIdParam };
