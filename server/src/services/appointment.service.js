'use strict';
const appointmentRepo = require('../repositories/appointment.repository');
const patientRepo     = require('../repositories/patient.repository');
const doctorRepo      = require('../repositories/doctor.repository');
const ApiError        = require('../utils/ApiError');
const { paginate }    = require('../utils/pagination');

class AppointmentService {
  async getAll(queryParams) {
    const meta = paginate(queryParams, 0);
    const allowed = ['appt_date', 'created_at', 'status'];
    const { rows, total } = await appointmentRepo.findAll({
      limit:      meta.limit,
      offset:     meta.offset,
      status:     queryParams.status,
      doctor_id:  queryParams.doctor_id,
      patient_id: queryParams.patient_id,
      date_from:  queryParams.date_from,
      date_to:    queryParams.date_to,
      sortBy:     allowed.includes(queryParams.sortBy) ? queryParams.sortBy : 'appt_date',
      sortDir:    queryParams.sortDir === 'desc' ? 'DESC' : 'ASC',
    });
    return { rows, meta: { ...paginate(queryParams, total) } };
  }

  async getById(id) {
    const appt = await appointmentRepo.findById(id);
    if (!appt) throw ApiError.notFound('Appointment not found');
    return appt;
  }

  async create(data) {
    // Verify patient & doctor exist
    const [patient, doctor] = await Promise.all([
      patientRepo.findById(data.patient_id),
      doctorRepo.findById(data.doctor_id),
    ]);
    if (!patient) throw ApiError.notFound('Patient not found');
    if (!doctor)  throw ApiError.notFound('Doctor not found');

    // ⚡ BUSINESS RULE: Prevent double-booking
    const conflict = await appointmentRepo.checkDoubleBook(data.doctor_id, data.appt_date, data.appt_time);
    if (conflict) {
      throw ApiError.conflict(
        `Dr. ${doctor.last_name} already has an appointment at ${data.appt_date} ${data.appt_time}`
      );
    }

    return appointmentRepo.create(data);
  }

  async updateStatus(id, status, notes) {
    const appt = await appointmentRepo.findById(id);
    if (!appt) throw ApiError.notFound('Appointment not found');
    return appointmentRepo.updateStatus(id, status, notes);
  }

  async addServices(appointmentId, services) {
    const appt = await appointmentRepo.findById(appointmentId);
    if (!appt) throw ApiError.notFound('Appointment not found');
    if (appt.status === 'cancelled') throw ApiError.badRequest('Cannot add services to a cancelled appointment');

    await appointmentRepo.addServices(appointmentId, services);
    return appointmentRepo.getServices(appointmentId);
  }

  async getServices(appointmentId) {
    await this.getById(appointmentId);
    return appointmentRepo.getServices(appointmentId);
  }

  async getTotalCost(appointmentId) {
    await this.getById(appointmentId);
    return appointmentRepo.getTotalCost(appointmentId);
  }

  async delete(id) {
    // Only allow cancellation style delete
    const result = await appointmentRepo.softDelete(id);
    if (!result) throw ApiError.notFound('Appointment not found');
    return { message: 'Appointment cancelled' };
  }
}

module.exports = new AppointmentService();
