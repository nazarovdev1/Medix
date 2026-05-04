'use strict';
const db = require('../db/pool');

class DiagnosticRepository {
  async findByAppointment(appointmentId) {
    const { rows } = await db.query(
      'SELECT * FROM diagnostics WHERE appointment_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC',
      [appointmentId]
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM diagnostics WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO diagnostics (appointment_id, description, severity, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [data.appointment_id, data.description, data.severity, data.notes]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE diagnostics SET ${setClause} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...Object.values(data)]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE diagnostics SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new DiagnosticRepository();
