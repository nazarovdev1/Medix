'use strict';
const patientService = require('../services/patient.service');
const ApiResponse    = require('../utils/ApiResponse');
const { writeAuditLog } = require('../middlewares/auditLog.middleware');

class PatientController {
  async getAll(req, res, next) {
    try {
      const result = await patientService.getAll(req.query);
      return res.json(new ApiResponse(200, result.rows, 'Patients retrieved', result.meta));
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const patient = await patientService.getById(req.params.id);
      return res.json(new ApiResponse(200, patient));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const patient = await patientService.create(req.body);
      await writeAuditLog({ tableName: 'patients', recordId: patient.id, action: 'INSERT', changedBy: req.user?.id, ipAddress: req.ip, newValues: patient });
      return res.status(201).json(new ApiResponse(201, patient, 'Patient created'));
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const patient = await patientService.update(req.params.id, req.body);
      await writeAuditLog({ tableName: 'patients', recordId: patient.id, action: 'UPDATE', changedBy: req.user?.id, ipAddress: req.ip, newValues: req.body });
      return res.json(new ApiResponse(200, patient, 'Patient updated'));
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const result = await patientService.delete(req.params.id);
      await writeAuditLog({ tableName: 'patients', recordId: req.params.id, action: 'DELETE', changedBy: req.user?.id, ipAddress: req.ip });
      return res.json(new ApiResponse(200, result));
    } catch (err) { next(err); }
  }
}

module.exports = new PatientController();
