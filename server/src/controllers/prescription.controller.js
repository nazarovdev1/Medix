'use strict';
const prescriptionService = require('../services/prescription.service');
const ApiResponse         = require('../utils/ApiResponse');

class PrescriptionController {
  async getByAppointment(req, res, next) {
    try {
      const prescriptions = await prescriptionService.getByAppointment(req.params.appointmentId);
      return res.json(new ApiResponse(200, prescriptions));
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const p = await prescriptionService.getById(req.params.id);
      return res.json(new ApiResponse(200, p));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const p = await prescriptionService.create(req.body);
      return res.status(201).json(new ApiResponse(201, p, 'Prescription issued'));
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const p = await prescriptionService.update(req.params.id, req.body);
      return res.json(new ApiResponse(200, p, 'Prescription updated'));
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const result = await prescriptionService.delete(req.params.id);
      return res.json(new ApiResponse(200, result));
    } catch (err) { next(err); }
  }
}

module.exports = new PrescriptionController();
