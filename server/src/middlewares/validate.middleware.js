'use strict';
const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware factory.
 * @param {object} schema - Joi schema with optional body/query/params keys
 */
const validate = (schema) => (req, _res, next) => {
  const errors = [];

  for (const key of ['body', 'query', 'params']) {
    if (!schema[key]) continue;
    const { error } = schema[key].validate(req[key], { abortEarly: false, stripUnknown: true });
    if (error) {
      errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })));
    } else {
      // Overwrite with sanitised value
      req[key] = schema[key].validate(req[key], { stripUnknown: true }).value;
    }
  }

  if (errors.length) {
    return next(ApiError.unprocessable('Validation failed', errors));
  }
  next();
};

module.exports = validate;
