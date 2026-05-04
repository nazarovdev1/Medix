import api from './api';

export const authService = {
  register: (data)       => api.post('/auth/register', data),
  login:    (data)       => api.post('/auth/login', data),
  logout:   ()           => api.post('/auth/logout'),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me:       ()           => api.get('/auth/me'),
};

export const patientService = {
  getAll:   (params) => api.get('/patients', { params }),
  getById:  (id)     => api.get(`/patients/${id}`),
  create:   (data)   => api.post('/patients', data),
  update:   (id, data) => api.put(`/patients/${id}`, data),
  delete:   (id)     => api.delete(`/patients/${id}`),
};

export const doctorService = {
  getAll:      (params) => api.get('/doctors', { params }),
  getById:     (id)     => api.get(`/doctors/${id}`),
  getSchedule: (id, params) => api.get(`/doctors/${id}/schedule`, { params }),
  create:      (data)   => api.post('/doctors', data),
  update:      (id, data) => api.put(`/doctors/${id}`, data),
  delete:      (id)     => api.delete(`/doctors/${id}`),
};

export const appointmentService = {
  getAll:       (params) => api.get('/appointments', { params }),
  getById:      (id)     => api.get(`/appointments/${id}`),
  create:       (data)   => api.post('/appointments', data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  addServices:  (id, data) => api.post(`/appointments/${id}/services`, data),
  getServices:  (id)     => api.get(`/appointments/${id}/services`),
  getTotalCost: (id)     => api.get(`/appointments/${id}/total-cost`),
  delete:       (id)     => api.delete(`/appointments/${id}`),
};

export const paymentService = {
  getAll:       (params) => api.get('/payments', { params }),
  getById:      (id)     => api.get(`/payments/${id}`),
  create:       (data)   => api.post('/payments', data),
  updateStatus: (id, data) => api.patch(`/payments/${id}/status`, data),
};

export const diagnosticService = {
  getByAppointment: (appointmentId) => api.get(`/diagnostics/appointment/${appointmentId}`),
  getById:  (id)    => api.get(`/diagnostics/${id}`),
  create:   (data)  => api.post('/diagnostics', data),
  update:   (id, data) => api.put(`/diagnostics/${id}`, data),
  delete:   (id)    => api.delete(`/diagnostics/${id}`),
};

export const prescriptionService = {
  getByAppointment: (appointmentId) => api.get(`/prescriptions/appointment/${appointmentId}`),
  getById:  (id)    => api.get(`/prescriptions/${id}`),
  create:   (data)  => api.post('/prescriptions', data),
  update:   (id, data) => api.put(`/prescriptions/${id}`, data),
  delete:   (id)    => api.delete(`/prescriptions/${id}`),
};

export const serviceApiService = {
  getAll:  (params) => api.get('/services', { params }),
  create:  (data)   => api.post('/services', data),
  update:  (id, data) => api.put(`/services/${id}`, data),
  delete:  (id)     => api.delete(`/services/${id}`),
};

export const departmentService = {
  getAll:  ()         => api.get('/departments'),
  create:  (data)     => api.post('/departments', data),
  update:  (id, data) => api.put(`/departments/${id}`, data),
  delete:  (id)       => api.delete(`/departments/${id}`),
};
