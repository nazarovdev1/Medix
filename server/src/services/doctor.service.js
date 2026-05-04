'use strict';
const doctorRepo   = require('../repositories/doctor.repository');
const ApiError     = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

class DoctorService {
  async getAll(queryParams) {
    const meta = paginate(queryParams, 0);
    const allowed = ['last_name', 'created_at', 'speciality'];
    const { rows, total } = await doctorRepo.findAll({
      limit:         meta.limit,
      offset:        meta.offset,
      search:        queryParams.search,
      speciality:    queryParams.speciality,
      department_id: queryParams.department_id,
      sortBy:        allowed.includes(queryParams.sortBy) ? queryParams.sortBy : 'created_at',
      sortDir:       queryParams.sortDir === 'asc' ? 'ASC' : 'DESC',
    });
    return { rows, meta: { ...paginate(queryParams, total) } };
  }

  async getById(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw ApiError.notFound('Doctor not found');
    return doctor;
  }

  async getSchedule(id, dateFrom, dateTo) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw ApiError.notFound('Doctor not found');
    const from = dateFrom || new Date().toISOString().split('T')[0];
    const to   = dateTo   || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    return doctorRepo.getSchedule(id, from, to);
  }

  async create(data) { return doctorRepo.create(data); }

  async update(id, data) {
    const doctor = await doctorRepo.update(id, data);
    if (!doctor) throw ApiError.notFound('Doctor not found');
    return doctor;
  }

  async delete(id) {
    const result = await doctorRepo.softDelete(id);
    if (!result) throw ApiError.notFound('Doctor not found');
    return { message: 'Doctor deleted' };
  }
}

module.exports = new DoctorService();
