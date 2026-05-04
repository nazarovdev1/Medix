'use strict';
const db = require('../db/pool');

class PrescriptionRepository {
  async findByAppointment(appointmentId) {
    const { rows } = await db.query(
      'SELECT * FROM prescriptions WHERE appointment_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC',
      [appointmentId]
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM prescriptions WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO prescriptions
         (appointment_id, medication_name, dosage, frequency, duration_days, pharmacy, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.appointment_id, data.medication_name, data.dosage, data.frequency,
       data.duration_days, data.pharmacy, data.notes]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE prescriptions SET ${setClause} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...Object.values(data)]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE prescriptions SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new PrescriptionRepository();
