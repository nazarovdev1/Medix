'use strict';
const { Pool } = require('pg');
const config   = require('../config');
const logger   = require('../utils/logger');

// Determine SSL config — Render requires SSL but rejectUnauthorized must be false
const isRender = config.db.connectionString &&
  config.db.connectionString.includes('render.com');

const sslConfig = isRender
  ? { rejectUnauthorized: false }
  : (config.db.ssl || false);

const pool = new Pool({
  connectionString: config.db.connectionString,
  ssl: isRender ? { rejectUnauthorized: false } : config.db.ssl,
  max: config.db.max || 10,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis || 30000,
  keepAlive: true,
});

pool.on('connect', (client) => {
  logger.debug('Database pool connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected DB pool error', { error: err.message });
});

/**
 * Execute a SQL query using the pool.
 * Retries once on ECONNRESET or connection timeout.
 * @param {string} text   - Parameterised SQL
 * @param {Array}  params - Query parameters
 */
const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    const isRetryable = err.code === 'ECONNRESET' ||
      err.message.includes('Connection terminated') ||
      err.message.includes('connection timeout');
    if (isRetryable) {
      logger.warn('DB connection error, retrying once...', { error: err.message });
      return await pool.query(text, params);
    }
    throw err;
  }
};

/**
 * Get a client from the pool for transaction management.
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
