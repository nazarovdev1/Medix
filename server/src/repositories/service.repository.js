'use strict';
const db = require('../db/pool');

class ServiceRepository {
  async findAll({ limit, offset, search, sortBy, sortDir }) {
    const params = [limit, offset];
    let where = 'WHERE is_deleted = FALSE AND is_active = TRUE';
    if (search) { params.push(`%${search}%`); where += ` AND (name ILIKE $${params.length} OR department ILIKE $${params.length})`; }

    const [rows, countRes] = await Promise.all([
      db.query(`SELECT * FROM services ${where} ORDER BY ${sortBy} ${sortDir} LIMIT $1 OFFSET $2`, params),
      db.query(`SELECT COUNT(*) FROM services ${where}`, params.slice(2)),
    ]);
    return { rows: rows.rows, total: parseInt(countRes.rows[0].count, 10) };
  }

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM services WHERE id = $1 AND is_deleted = FALSE', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await db.query(
      'INSERT INTO services (name, description, base_cost, department) VALUES ($1,$2,$3,$4) RETURNING *',
      [data.name, data.description, data.base_cost, data.department]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE services SET ${setClause} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...Object.values(data)]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query('UPDATE services SET is_deleted = TRUE WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  }
}

module.exports = new ServiceRepository();
