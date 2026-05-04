'use strict';
const patientRepo = require('../repositories/patient.repository');
const ApiError    = require('../utils/ApiError');
const { paginate, buildOrderBy } = require('../utils/pagination');

class PatientService {
  async getAll(queryParams) {
    const meta = paginate(queryParams, 0);
    const allowed = ['last_name', 'created_at', 'date_of_birth'];
    const { rows, total } = await patientRepo.findAll({
      limit:   meta.limit,
      offset:  meta.offset,
      search:  queryParams.search,
      sortBy:  allowed.includes(queryParams.sortBy) ? queryParams.sortBy : 'created_at',
      sortDir: queryParams.sortDir === 'asc' ? 'ASC' : 'DESC',
    });
    return { rows, meta: { ...paginate(queryParams, total) } };
  }

  async getById(id) {
    const patient = await patientRepo.findById(id);
    if (!patient) throw ApiError.notFound('Patient not found');
    return patient;
  }

  async create(data) {
    return patientRepo.create(data);
  }

  async update(id, data) {
    const patient = await patientRepo.update(id, data);
    if (!patient) throw ApiError.notFound('Patient not found');
    return patient;
  }

  async delete(id) {
    const result = await patientRepo.softDelete(id);
    if (!result) throw ApiError.notFound('Patient not found');
    return { message: 'Patient deleted successfully' };
  }
}

module.exports = new PatientService();
