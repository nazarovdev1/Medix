'use strict';
const diagnosticService = require('../services/diagnostic.service');
const ApiResponse       = require('../utils/ApiResponse');

class DiagnosticController {
  async getByAppointment(req, res, next) {
    try {
      const diagnostics = await diagnosticService.getByAppointment(req.params.appointmentId);
      return res.json(new ApiResponse(200, diagnostics));
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const d = await diagnosticService.getById(req.params.id);
      return res.json(new ApiResponse(200, d));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const d = await diagnosticService.create(req.body);
      return res.status(201).json(new ApiResponse(201, d, 'Diagnostic created'));
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const d = await diagnosticService.update(req.params.id, req.body);
      return res.json(new ApiResponse(200, d, 'Diagnostic updated'));
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const result = await diagnosticService.delete(req.params.id);
      return res.json(new ApiResponse(200, result));
    } catch (err) { next(err); }
  }
}

module.exports = new DiagnosticController();
