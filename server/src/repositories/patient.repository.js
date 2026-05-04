'use strict';
const db = require('../db/pool');

class PatientRepository {
  async findAll({ limit, offset, search, sortBy, sortDir }) {
    const params  = [limit, offset];
    let   where   = 'WHERE is_deleted = FALSE';

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    const [rows, countRes] = await Promise.all([
      db.query(
        `SELECT * FROM patients ${where} ORDER BY ${sortBy} ${sortDir} LIMIT $1 OFFSET $2`,
        params
      ),
      db.query(`SELECT COUNT(*) FROM patients ${where}`, params.slice(2)),
    ]);
    return { rows: rows.rows, total: parseInt(countRes.rows[0].count, 10) };
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM patients WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    return rows[0] || null;
  }

  async findByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM patients WHERE user_id = $1 AND is_deleted = FALSE',
      [userId]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO patients
         (user_id, first_name, last_name, date_of_birth, gender, phone, email,
          address, emergency_contact, insurance_id, blood_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [data.user_id, data.first_name, data.last_name, data.date_of_birth,
       data.gender, data.phone, data.email, data.address,
       data.emergency_contact, data.insurance_id, data.blood_type]
    );
    return rows[0];
  }

  async update(id, data) {
    // Filter out fields that should not be updated manually
    const protectedFields = ['id', 'user_id', 'created_at', 'updated_at', 'is_deleted'];
    const fields = Object.keys(data).filter(f => !protectedFields.includes(f));
    
    if (fields.length === 0) return this.findById(id);

    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => data[f]);

    const { rows } = await db.query(
      `UPDATE patients SET ${setClause} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE patients SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new PatientRepository();
