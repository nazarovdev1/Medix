'use strict';

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable message
   * @param {Array}  errors     - Validation error details
   * @param {string} stack      - Optional stack override
   */
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message    = message;
    this.errors     = errors;
    this.isApiError = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg, errors = [])    { return new ApiError(400, msg, errors); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
  static forbidden(msg = 'Forbidden')    { return new ApiError(403, msg); }
  static notFound(msg = 'Not found')     { return new ApiError(404, msg); }
  static conflict(msg)                   { return new ApiError(409, msg); }
  static unprocessable(msg, errors = []) { return new ApiError(422, msg, errors); }
  static internal(msg = 'Internal server error') { return new ApiError(500, msg); }
}

module.exports = ApiError;
