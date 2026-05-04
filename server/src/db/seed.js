'use strict';
const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');
const logger   = require('../utils/logger');

async function seed() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../seeds/seed.sql'),
    'utf8'
  );
  try {
    await pool.query(sql);
    logger.info('✅ Seed data inserted successfully');
  } catch (err) {
    logger.error('Seed failed', { error: err.message });
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
