'use strict';
const appointmentService = require('../services/appointment.service');
const doctorRepo         = require('../repositories/doctor.repository');
const ApiResponse        = require('../utils/ApiResponse');
const { writeAuditLog }  = require('../middlewares/auditLog.middleware');

class AppointmentController {
  async getAll(req, res, next) {
    try {
      const query = { ...req.query };
      
      // If user is a doctor, they should only see their own appointments by default
      if (req.user.role === 'doctor') {
        const doctor = await doctorRepo.findByUserId(req.user.id);
        if (doctor) {
          query.doctor_id = doctor.id;
        }
      }

      const result = await appointmentService.getAll(query);
      return res.json(new ApiResponse(200, result.rows, 'Appointments retrieved', result.meta));
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const appt = await appointmentService.getById(req.params.id);
      
      if (req.user.role === 'doctor') {
        const doctor = await doctorRepo.findByUserId(req.user.id);
        if (doctor && appt.doctor_id !== doctor.id) {
          return res.status(403).json(new ApiResponse(403, null, 'Ushbu turniga kirish huquqi yo\'q'));
        }
      }
      
      return res.json(new ApiResponse(200, appt));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const appt = await appointmentService.create(req.body);
      await writeAuditLog({ tableName: 'appointments', recordId: appt.id, action: 'INSERT', changedBy: req.user?.id, ipAddress: req.ip, newValues: appt });
      return res.status(201).json(new ApiResponse(201, appt, 'Appointment scheduled'));
    } catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try {
      const appt = await appointmentService.updateStatus(req.params.id, req.body.status, req.body.notes);
      await writeAuditLog({ tableName: 'appointments', recordId: appt.id, action: 'UPDATE', changedBy: req.user?.id, ipAddress: req.ip, newValues: { status: req.body.status } });
      return res.json(new ApiResponse(200, appt, 'Appointment status updated'));
    } catch (err) { next(err); }
  }

  async addServices(req, res, next) {
    try {
      const services = await appointmentService.addServices(req.params.id, req.body.services);
      return res.status(201).json(new ApiResponse(201, services, 'Services added to appointment'));
    } catch (err) { next(err); }
  }

  async getServices(req, res, next) {
    try {
      const services = await appointmentService.getServices(req.params.id);
      return res.json(new ApiResponse(200, services));
    } catch (err) { next(err); }
  }

  async getTotalCost(req, res, next) {
    try {
      const total = await appointmentService.getTotalCost(req.params.id);
      return res.json(new ApiResponse(200, { total }));
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const result = await appointmentService.delete(req.params.id);
      await writeAuditLog({ tableName: 'appointments', recordId: req.params.id, action: 'DELETE', changedBy: req.user?.id, ipAddress: req.ip });
      return res.json(new ApiResponse(200, result));
    } catch (err) { next(err); }
  }
}

module.exports = new AppointmentController();
