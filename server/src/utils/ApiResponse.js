'use strict';

class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {any}    data
   * @param {string} message
   * @param {object} meta       - Pagination etc.
   */
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.success    = statusCode < 400;
    this.statusCode = statusCode;
    this.message    = message;
    this.data       = data;
    if (meta) this.meta = meta;
    this.timestamp  = new Date().toISOString();
  }
}

module.exports = ApiResponse;
