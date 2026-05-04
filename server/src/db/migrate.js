'use strict';
const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');
const logger   = require('../utils/logger');

async function migrate() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../migrations/001_schema.sql'),
    'utf8'
  );
  try {
    await pool.query(sql);
    logger.info('✅ Migration 001_schema.sql applied successfully');
  } catch (err) {
    logger.error('Migration failed', { error: err.message });
    throw err;
  } finally {
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
