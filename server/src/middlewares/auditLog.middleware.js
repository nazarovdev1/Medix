'use strict';
const { query } = require('../db/pool');
const logger    = require('../utils/logger');

/**
 * Write an audit log entry.
 */
const writeAuditLog = async ({ tableName, recordId, action, changedBy, ipAddress, oldValues, newValues }) => {
  try {
    await query(
      `INSERT INTO audit_logs
         (table_name, record_id, action, changed_by, ip_address, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5::inet, $6, $7)`,
      [tableName, recordId, action, changedBy || null, ipAddress || null,
       oldValues ? JSON.stringify(oldValues) : null,
       newValues ? JSON.stringify(newValues) : null]
    );
  } catch (err) {
    // Audit failure must not break the main request
    logger.error('Audit log write failed', { error: err.message });
  }
};

/**
 * Express middleware — automatically logs mutating requests.
 */
const auditLog = (tableName) => (req, _res, next) => {
  req._auditTable = tableName;
  req._auditIp    = req.ip;
  next();
};

module.exports = { writeAuditLog, auditLog };
