'use strict';
const paymentService = require('../services/payment.service');
const ApiResponse    = require('../utils/ApiResponse');
const { writeAuditLog } = require('../middlewares/auditLog.middleware');

class PaymentController {
  async getAll(req, res, next) {
    try {
      const result = await paymentService.getAll(req.query);
      return res.json(new ApiResponse(200, result.rows, 'Payments retrieved', result.meta));
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const payment = await paymentService.getById(req.params.id);
      return res.json(new ApiResponse(200, payment));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const payment = await paymentService.createForAppointment(req.body);
      await writeAuditLog({ tableName: 'payments', recordId: payment.id, action: 'INSERT', changedBy: req.user?.id, ipAddress: req.ip, newValues: payment });
      return res.status(201).json(new ApiResponse(201, payment, 'Payment created'));
    } catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try {
      const payment = await paymentService.updateStatus(req.params.id, req.body.status);
      await writeAuditLog({ tableName: 'payments', recordId: payment.id, action: 'UPDATE', changedBy: req.user?.id, ipAddress: req.ip, newValues: { status: req.body.status } });
      return res.json(new ApiResponse(200, payment, 'Payment status updated'));
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const result = await paymentService.delete(req.params.id);
      return res.json(new ApiResponse(200, result));
    } catch (err) { next(err); }
  }
}

module.exports = new PaymentController();
