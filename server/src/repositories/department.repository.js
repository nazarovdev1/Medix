'use strict';
const db = require('../db/pool');

class DepartmentRepository {
  async findAll() {
    const { rows } = await db.query(
      'SELECT * FROM departments WHERE is_deleted = FALSE ORDER BY name ASC'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM departments WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await db.query(
      'INSERT INTO departments (name, description) VALUES ($1,$2) RETURNING *',
      [data.name, data.description]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const set = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE departments SET ${set} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...Object.values(data)]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rows } = await db.query(
      'UPDATE departments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new DepartmentRepository();
