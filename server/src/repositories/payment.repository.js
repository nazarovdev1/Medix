'use strict';
const db = require('../db/pool');

class PaymentRepository {
  async findAll({ limit, offset, status, sortBy, sortDir }) {
    const params = [limit, offset];
    const conditions = ['p.is_deleted = FALSE'];
    if (status) { params.push(status); conditions.push(`p.status = $${params.length}`); }
    const where = 'WHERE ' + conditions.join(' AND ');

    const sql = `
      SELECT p.*,
             a.appt_date, a.appt_time,
             pt.first_name || ' ' || pt.last_name AS patient_name
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      JOIN patients pt ON a.patient_id = pt.id
      ${where}
      ORDER BY p.${sortBy} ${sortDir}
      LIMIT $1 OFFSET $2
    `;
    const [rows, countRes] = await Promise.all([
      db.query(sql, params),
      db.query(`SELECT COUNT(*) FROM payments p ${where}`, params.slice(2)),
    ]);
    return { rows: rows.rows, total: parseInt(countRes.rows[0].count, 10) };
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT p.*, a.appt_date, a.appt_time,
              pt.first_name || ' ' || pt.last_name AS patient_name,
              dr.first_name || ' ' || dr.last_name AS doctor_name
       FROM payments p
       JOIN appointments a ON p.appointment_id = a.id
       JOIN patients  pt ON a.patient_id = pt.id
       JOIN doctors   dr ON a.doctor_id  = dr.id
       WHERE p.id = $1 AND p.is_deleted = FALSE`,
      [id]
    );
    return rows[0] || null;
  }

  async findByAppointmentId(apptId) {
    const { rows } = await db.query(
      'SELECT * FROM payments WHERE appointment_id = $1 AND is_deleted = FALSE',
      [apptId]
    );
    return rows[0] || null;
  }

  async create(data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Generate receipt number
      const receipt = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const { rows } = await client.query(
        `INSERT INTO payments (appointment_id, amount, payment_method, receipt_number, status, notes)
         VALUES ($1,$2,$3,$4,'pending',$5) RETURNING *`,
        [data.appointment_id, data.amount, data.payment_method, receipt, data.notes]
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateStatus(id, status) {
    const { rows } = await db.query(
      'UPDATE payments SET status = $2 WHERE id = $1 RETURNING *',
      [id, status]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE payments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new PaymentRepository();
