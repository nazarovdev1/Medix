'use strict';
const Joi = require('joi');

const register = {
  body: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).max(72).required(),
    role:     Joi.string().valid('admin', 'doctor', 'patient').default('patient'),
  }),
};

const login = {
  body: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const refresh = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = { register, login, refresh };
