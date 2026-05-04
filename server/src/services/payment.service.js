'use strict';
const paymentRepo     = require('../repositories/payment.repository');
const appointmentRepo = require('../repositories/appointment.repository');
const ApiError        = require('../utils/ApiError');
const { paginate }    = require('../utils/pagination');

class PaymentService {
  async getAll(queryParams) {
    const meta = paginate(queryParams, 0);
    const { rows, total } = await paymentRepo.findAll({
      limit:   meta.limit,
      offset:  meta.offset,
      status:  queryParams.status,
      sortBy:  queryParams.sortBy || 'payment_date',
      sortDir: queryParams.sortDir === 'asc' ? 'ASC' : 'DESC',
    });
    return { rows, meta: { ...paginate(queryParams, total) } };
  }

  async getById(id) {
    const payment = await paymentRepo.findById(id);
    if (!payment) throw ApiError.notFound('Payment not found');
    return payment;
  }

  async createForAppointment(data) {
    // Check appointment exists
    const appt = await appointmentRepo.findById(data.appointment_id);
    if (!appt) throw ApiError.notFound('Appointment not found');

    // Prevent duplicate payment
    const existing = await paymentRepo.findByAppointmentId(data.appointment_id);
    if (existing) throw ApiError.conflict('Payment already exists for this appointment');

    // ⚡ Auto-calculate amount from services
    const total = await appointmentRepo.getTotalCost(data.appointment_id);
    data.amount = total > 0 ? total : (data.amount || 0);

    return paymentRepo.create(data);
  }

  async updateStatus(id, status) {
    const payment = await paymentRepo.updateStatus(id, status);
    if (!payment) throw ApiError.notFound('Payment not found');
    return payment;
  }

  async delete(id) {
    const result = await paymentRepo.softDelete(id);
    if (!result) throw ApiError.notFound('Payment not found');
    return { message: 'Payment deleted' };
  }
}

module.exports = new PaymentService();
