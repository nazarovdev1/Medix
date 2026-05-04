'use strict';
const doctorService  = require('../services/doctor.service');
const ApiResponse    = require('../utils/ApiResponse');
const { writeAuditLog } = require('../middlewares/auditLog.middleware');

class DoctorController {
  async getAll(req, res, next) {
    try {
      const result = await doctorService.getAll(req.query);
      return res.json(new ApiResponse(200, result.rows, 'Doctors retrieved', result.meta));
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const doctor = await doctorService.getById(req.params.id);
      return res.json(new ApiResponse(200, doctor));
    } catch (err) { next(err); }
  }

  async getSchedule(req, res, next) {
    try {
      const schedule = await doctorService.getSchedule(req.params.id, req.query.date_from, req.query.date_to);
      return res.json(new ApiResponse(200, schedule));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const doctor = await doctorService.create(req.body);
      await writeAuditLog({ tableName: 'doctors', recordId: doctor.id, action: 'INSERT', changedBy: req.user?.id, ipAddress: req.ip, newValues: doctor });
      return res.status(201).json(new ApiResponse(201, doctor, 'Doctor created'));
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const doctor = await doctorService.update(req.params.id, req.body);
      await writeAuditLog({ tableName: 'doctors', recordId: doctor.id, action: 'UPDATE', changedBy: req.user?.id, ipAddress: req.ip, newValues: req.body });
      return res.json(new ApiResponse(200, doctor, 'Doctor updated'));
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const result = await doctorService.delete(req.params.id);
      await writeAuditLog({ tableName: 'doctors', recordId: req.params.id, action: 'DELETE', changedBy: req.user?.id, ipAddress: req.ip });
      return res.json(new ApiResponse(200, result));
    } catch (err) { next(err); }
  }
}

module.exports = new DoctorController();
