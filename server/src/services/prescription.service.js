'use strict';
const prescriptionRepo = require('../repositories/prescription.repository');
const appointmentRepo  = require('../repositories/appointment.repository');
const ApiError         = require('../utils/ApiError');

class PrescriptionService {
  async getByAppointment(appointmentId) {
    const appt = await appointmentRepo.findById(appointmentId);
    if (!appt) throw ApiError.notFound('Appointment not found');
    return prescriptionRepo.findByAppointment(appointmentId);
  }

  async getById(id) {
    const p = await prescriptionRepo.findById(id);
    if (!p) throw ApiError.notFound('Prescription not found');
    return p;
  }

  async create(data) {
    const appt = await appointmentRepo.findById(data.appointment_id);
    if (!appt) throw ApiError.notFound('Appointment not found');

    // ⚡ BUSINESS RULE: Prescription only for completed appointments
    if (appt.status !== 'completed') {
      throw ApiError.badRequest('Prescriptions can only be issued for completed appointments');
    }

    return prescriptionRepo.create(data);
  }

  async update(id, data) {
    const result = await prescriptionRepo.update(id, data);
    if (!result) throw ApiError.notFound('Prescription not found');
    return result;
  }

  async delete(id) {
    const result = await prescriptionRepo.softDelete(id);
    if (!result) throw ApiError.notFound('Prescription not found');
    return { message: 'Prescription deleted' };
  }
}

module.exports = new PrescriptionService();
