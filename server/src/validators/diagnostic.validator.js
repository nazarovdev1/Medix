'use strict';
const Joi = require('joi');

const uuidParam    = { params: Joi.object({ id: Joi.string().uuid().required() }) };
const apptIdParam  = { params: Joi.object({ appointmentId: Joi.string().uuid().required() }) };

const create = {
  body: Joi.object({
    appointment_id: Joi.string().uuid().required(),
    description:    Joi.string().required(),
    severity:       Joi.string().valid('mild','moderate','severe','critical').default('mild'),
    notes:          Joi.string().optional().allow(null, ''),
  }),
};

const update = {
  params: Joi.object({ id: Joi.string().uuid().required() }),
  body: create.body.fork(Object.keys(create.body.describe().keys), f => f.optional()),
};

module.exports = { create, update, uuidParam, apptIdParam };
