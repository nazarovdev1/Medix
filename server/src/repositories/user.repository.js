'use strict';
const db = require('../db/pool');

class UserRepository {
  async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, email, role, is_active, last_login_at FROM users WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role, is_active',
      [data.email, data.passwordHash, data.role]
    );
    return rows[0];
  }

  async updateRefreshToken(id, token) {
    await db.query('UPDATE users SET refresh_token = $2 WHERE id = $1', [id, token]);
  }

  async updateLastLogin(id) {
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
  }

  async findByRefreshToken(token) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE refresh_token = $1 AND is_deleted = FALSE AND is_active = TRUE',
      [token]
    );
    return rows[0] || null;
  }

  async revokeRefreshToken(id) {
    await db.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [id]);
  }

  async findAll({ limit, offset, role }) {
    const params = [limit, offset];
    let where = 'WHERE is_deleted = FALSE';
    if (role) { params.push(role); where += ` AND role = $${params.length}`; }
    const { rows } = await db.query(
      `SELECT id, email, role, is_active, last_login_at, created_at FROM users ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );
    return rows;
  }
}

module.exports = new UserRepository();
