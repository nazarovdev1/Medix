'use strict';
const authService  = require('../services/auth.service');
const ApiResponse  = require('../utils/ApiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json(new ApiResponse(200, result, 'Login successful'));
    } catch (err) { next(err); }
  }

  async refresh(req, res, next) {
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      return res.status(200).json(new ApiResponse(200, tokens, 'Tokens refreshed'));
    } catch (err) { next(err); }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (err) { next(err); }
  }

  async me(req, res) {
    return res.status(200).json(new ApiResponse(200, req.user, 'Current user'));
  }
}

module.exports = new AuthController();
