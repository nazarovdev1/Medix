'use strict';
const db = require('../db/pool');

class AppointmentRepository {
  async findAll(filters) {
    const { limit, offset, status, doctor_id, patient_id, date_from, date_to, sortBy, sortDir } = filters;
    const params = [limit, offset];
    const conditions = ['a.is_deleted = FALSE'];

    if (status)     { params.push(status);     conditions.push(`a.status = $${params.length}`); }
    if (doctor_id)  { params.push(doctor_id);  conditions.push(`a.doctor_id = $${params.length}`); }
    if (patient_id) { params.push(patient_id); conditions.push(`a.patient_id = $${params.length}`); }
    if (date_from)  { params.push(date_from);  conditions.push(`a.appt_date >= $${params.length}`); }
    if (date_to)    { params.push(date_to);    conditions.push(`a.appt_date <= $${params.length}`); }

    const where = 'WHERE ' + conditions.join(' AND ');
    const sql = `
      SELECT a.*,
             p.first_name || ' ' || p.last_name AS patient_name,
             dr.first_name || ' ' || dr.last_name AS doctor_name,
             dr.speciality
      FROM appointments a
      JOIN patients p  ON a.patient_id = p.id
      JOIN doctors  dr ON a.doctor_id  = dr.id
      ${where}
      ORDER BY a.${sortBy} ${sortDir}
      LIMIT $1 OFFSET $2
    `;
    const [rows, countRes] = await Promise.all([
      db.query(sql, params),
      db.query(`SELECT COUNT(*) FROM appointments a ${where}`, params.slice(2)),
    ]);
    return { rows: rows.rows, total: parseInt(countRes.rows[0].count, 10) };
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT a.*,
              p.first_name || ' ' || p.last_name AS patient_name, p.phone AS patient_phone,
              dr.first_name || ' ' || dr.last_name AS doctor_name, dr.speciality
       FROM appointments a
       JOIN patients p  ON a.patient_id = p.id
       JOIN doctors  dr ON a.doctor_id  = dr.id
       WHERE a.id = $1 AND a.is_deleted = FALSE`,
      [id]
    );
    return rows[0] || null;
  }

  async checkDoubleBook(doctorId, date, time, excludeId = null) {
    let sql = `
      SELECT id FROM appointments
      WHERE doctor_id = $1 AND appt_date = $2 AND appt_time = $3
        AND is_deleted = FALSE AND status NOT IN ('cancelled','no_show')
    `;
    const params = [doctorId, date, time];
    if (excludeId) { params.push(excludeId); sql += ` AND id != $${params.length}`; }
    const { rows } = await db.query(sql, params);
    return rows.length > 0;
  }

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appt_date, appt_time, reason, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.patient_id, data.doctor_id, data.appt_date, data.appt_time, data.reason, data.notes]
    );
    return rows[0];
  }

  async updateStatus(id, status, notes) {
    const { rows } = await db.query(
      `UPDATE appointments SET status = $2, notes = COALESCE($3, notes)
       WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, status, notes]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE appointments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }

  async getServices(appointmentId) {
    const { rows } = await db.query(
      `SELECT aps.*, s.name AS service_name, s.description
       FROM appointment_services aps
       JOIN services s ON aps.service_id = s.id
       WHERE aps.appointment_id = $1`,
      [appointmentId]
    );
    return rows;
  }

  async addServices(appointmentId, services) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      for (const svc of services) {
        // Fetch base price if not overriding
        const { rows: svcRows } = await client.query('SELECT base_cost FROM services WHERE id = $1', [svc.service_id]);
        const unitPrice = svc.unit_price || svcRows[0]?.base_cost || 0;
        await client.query(
          `INSERT INTO appointment_services (appointment_id, service_id, quantity, unit_price, discount_pct)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT DO NOTHING`,
          [appointmentId, svc.service_id, svc.quantity || 1, unitPrice, svc.discount_pct || 0]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getTotalCost(appointmentId) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(line_total), 0) AS total
       FROM appointment_services WHERE appointment_id = $1`,
      [appointmentId]
    );
    return parseFloat(rows[0].total);
  }
}

module.exports = new AppointmentRepository();
