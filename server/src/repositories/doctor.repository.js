'use strict';
const db = require('../db/pool');

class DoctorRepository {
  async findAll({ limit, offset, search, speciality, department_id, sortBy, sortDir }) {
    const params = [limit, offset];
    const conditions = ['d.is_deleted = FALSE'];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(d.first_name ILIKE $${params.length} OR d.last_name ILIKE $${params.length} OR d.email ILIKE $${params.length})`);
    }
    if (speciality) {
      params.push(`%${speciality}%`);
      conditions.push(`d.speciality ILIKE $${params.length}`);
    }
    if (department_id) {
      params.push(department_id);
      conditions.push(`d.department_id = $${params.length}`);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    const sql = `
      SELECT d.*, dept.name AS department_name, ds.day_of_week, ds.start_time, ds.end_time
      FROM doctors d
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN doctor_schedules ds ON d.schedule_id = ds.id
      ${where}
      ORDER BY d.${sortBy} ${sortDir}
      LIMIT $1 OFFSET $2
    `;
    const countSql = `SELECT COUNT(*) FROM doctors d ${where}`;

    const [rows, countRes] = await Promise.all([
      db.query(sql, params),
      db.query(countSql, params.slice(2)),
    ]);
    return { rows: rows.rows, total: parseInt(countRes.rows[0].count, 10) };
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT d.*, dept.name AS department_name, ds.day_of_week, ds.start_time, ds.end_time, ds.slot_duration
       FROM doctors d
       LEFT JOIN departments dept ON d.department_id = dept.id
       LEFT JOIN doctor_schedules ds ON d.schedule_id = ds.id
       WHERE d.id = $1 AND d.is_deleted = FALSE`,
      [id]
    );
    return rows[0] || null;
  }

  async findByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM doctors WHERE user_id = $1 AND is_deleted = FALSE',
      [userId]
    );
    return rows[0] || null;
  }

  async getSchedule(doctorId, dateFrom, dateTo) {
    const { rows } = await db.query(
      `SELECT a.id, a.appt_date, a.appt_time, a.status,
              p.first_name || ' ' || p.last_name AS patient_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = $1
         AND a.appt_date BETWEEN $2 AND $3
         AND a.is_deleted = FALSE
       ORDER BY a.appt_date, a.appt_time`,
      [doctorId, dateFrom, dateTo]
    );
    return rows;
  }

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO doctors (user_id, first_name, last_name, speciality, email, license_no, schedule_id, department_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [data.user_id, data.first_name, data.last_name, data.speciality,
       data.email, data.license_no, data.schedule_id, data.department_id]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE doctors SET ${setClause} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...Object.values(data)]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE doctors SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new DoctorRepository();
