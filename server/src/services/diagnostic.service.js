'use strict';
const diagnosticRepo  = require('../repositories/diagnostic.repository');
const appointmentRepo = require('../repositories/appointment.repository');
const ApiError        = require('../utils/ApiError');

class DiagnosticService {
  async getByAppointment(appointmentId) {
    const appt = await appointmentRepo.findById(appointmentId);
    if (!appt) throw ApiError.notFound('Appointment not found');
    return diagnosticRepo.findByAppointment(appointmentId);
  }

  async getById(id) {
    const d = await diagnosticRepo.findById(id);
    if (!d) throw ApiError.notFound('Diagnostic not found');
    return d;
  }

  async create(data) {
    const appt = await appointmentRepo.findById(data.appointment_id);
    if (!appt) throw ApiError.notFound('Appointment not found');
    return diagnosticRepo.create(data);
  }

  async update(id, data) {
    const result = await diagnosticRepo.update(id, data);
    if (!result) throw ApiError.notFound('Diagnostic not found');
    return result;
  }

  async delete(id) {
    const result = await diagnosticRepo.softDelete(id);
    if (!result) throw ApiError.notFound('Diagnostic not found');
    return { message: 'Diagnostic deleted' };
  }
}

module.exports = new DiagnosticService();
