'use strict';
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const config    = require('../config');
const userRepo  = require('../repositories/user.repository');
const ApiError  = require('../utils/ApiError');

class AuthService {
  async register({ email, password, role }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw ApiError.conflict('Email already registered');

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await userRepo.create({ email, passwordHash, role });
    return user;
  }

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    if (!user || !user.is_active) throw ApiError.unauthorized('Invalid credentials');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw ApiError.unauthorized('Invalid credentials');

    const tokens = this._generateTokens(user);
    await userRepo.updateRefreshToken(user.id, tokens.refreshToken);
    await userRepo.updateLastLogin(user.id);

    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepo.findByRefreshToken(refreshToken);
    if (!user || user.id !== payload.sub) throw ApiError.unauthorized('Refresh token mismatch');

    const tokens = this._generateTokens(user);
    await userRepo.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId) {
    await userRepo.revokeRefreshToken(userId);
  }

  _generateTokens(user) {
    const payload = { sub: user.id, role: user.role };
    const accessToken  = jwt.sign(payload, config.jwt.accessSecret,  { expiresIn: config.jwt.accessExpires });
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpires });
    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
