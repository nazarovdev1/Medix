'use strict';
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/db/pool');

async function runMigration(filename) {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', filename), 'utf8');
  try {
    await pool.query(sql);
    console.log(`✅ ${filename} applied`);
  } catch (err) {
    console.error(`❌ ${filename} failed:`, err.message);
  }
}

async function start() {
  await runMigration('002_add_cashier_role.sql');
  process.exit();
}

start();
