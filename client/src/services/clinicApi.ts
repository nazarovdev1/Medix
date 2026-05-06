import api from './api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Patient,
  PatientFormData,
  Doctor,
  DoctorFormData,
  Appointment,
  AppointmentFormData,
  Payment,
  PaymentFormData,
  PaginatedResponse,
  PaginationQuery,
} from '../types';

const unwrap = async <T>(res: Promise<unknown>): Promise<T> => {
  const data = await res;
  return (data as { data: T }).data;
};

export const authService = {
  register: (data: RegisterData): Promise<AuthResponse> =>
    unwrap<AuthResponse>(api.post('/auth/register', data)),
  login: (data: LoginCredentials): Promise<AuthResponse> =>
    unwrap<AuthResponse>(api.post('/auth/login', data)),
  logout: (): Promise<void> =>
    api.post('/auth/logout') as unknown as Promise<void>,
  refresh: (refreshToken: string): Promise<AuthResponse> =>
    unwrap<AuthResponse>(api.post('/auth/refresh', { refreshToken })),
  me: (): Promise<AuthResponse> =>
    unwrap<AuthResponse>(api.get('/auth/me')),
};

export const patientService = {
  getAll: (params?: PaginationQuery): Promise<PaginatedResponse<Patient>> =>
    api.get('/patients', { params }) as unknown as Promise<PaginatedResponse<Patient>>,
  getById: (id: string): Promise<Patient> =>
    unwrap<Patient>(api.get(`/patients/${id}`)),
  create: (data: PatientFormData): Promise<Patient> =>
    unwrap<Patient>(api.post('/patients', data)),
  update: (id: string, data: Partial<PatientFormData>): Promise<Patient> =>
    unwrap<Patient>(api.put(`/patients/${id}`, data)),
  delete: (id: string): Promise<void> =>
    api.delete(`/patients/${id}`) as unknown as Promise<void>,
};

export const doctorService = {
  getAll: (params?: PaginationQuery): Promise<PaginatedResponse<Doctor>> =>
    api.get('/doctors', { params }) as unknown as Promise<PaginatedResponse<Doctor>>,
  getById: (id: string): Promise<Doctor> =>
    unwrap<Doctor>(api.get(`/doctors/${id}`)),
  getSchedule: (id: string, params?: PaginationQuery): Promise<unknown> =>
    api.get(`/doctors/${id}/schedule`, { params }),
  create: (data: DoctorFormData): Promise<Doctor> =>
    unwrap<Doctor>(api.post('/doctors', data)),
  update: (id: string, data: Partial<DoctorFormData>): Promise<Doctor> =>
    unwrap<Doctor>(api.put(`/doctors/${id}`, data)),
  delete: (id: string): Promise<void> =>
    api.delete(`/doctors/${id}`) as unknown as Promise<void>,
};

export const appointmentService = {
  getAll: (params?: PaginationQuery): Promise<PaginatedResponse<Appointment>> =>
    api.get('/appointments', { params }) as unknown as Promise<PaginatedResponse<Appointment>>,
  getById: (id: string): Promise<Appointment> =>
    unwrap<Appointment>(api.get(`/appointments/${id}`)),
  create: (data: AppointmentFormData): Promise<Appointment> =>
    unwrap<Appointment>(api.post('/appointments', data)),
  updateStatus: (id: string, data: { status: string }): Promise<Appointment> =>
    unwrap<Appointment>(api.patch(`/appointments/${id}/status`, data)),
  addServices: (id: string, data: unknown): Promise<unknown> =>
    api.post(`/appointments/${id}/services`, data),
  getServices: (id: string): Promise<unknown> =>
    api.get(`/appointments/${id}/services`),
  getTotalCost: (id: string): Promise<unknown> =>
    api.get(`/appointments/${id}/total-cost`),
  delete: (id: string): Promise<void> =>
    api.delete(`/appointments/${id}`) as unknown as Promise<void>,
};

export const paymentService = {
  getAll: (params?: PaginationQuery): Promise<PaginatedResponse<Payment>> =>
    api.get('/payments', { params }) as unknown as Promise<PaginatedResponse<Payment>>,
  getById: (id: string): Promise<Payment> =>
    unwrap<Payment>(api.get(`/payments/${id}`)),
  create: (data: PaymentFormData): Promise<Payment> =>
    unwrap<Payment>(api.post('/payments', data)),
  updateStatus: (id: string, data: { status: string }): Promise<Payment> =>
    unwrap<Payment>(api.patch(`/payments/${id}/status`, data)),
};

export const diagnosticService = {
  getByAppointment: (appointmentId: string): Promise<unknown> =>
    api.get(`/diagnostics/appointment/${appointmentId}`),
  getById: (id: string): Promise<unknown> =>
    api.get(`/diagnostics/${id}`),
  create: (data: unknown): Promise<unknown> =>
    api.post('/diagnostics', data),
  update: (id: string, data: unknown): Promise<unknown> =>
    api.put(`/diagnostics/${id}`, data),
  delete: (id: string): Promise<void> =>
    api.delete(`/diagnostics/${id}`) as unknown as Promise<void>,
};

export const prescriptionService = {
  getByAppointment: (appointmentId: string): Promise<unknown> =>
    api.get(`/prescriptions/appointment/${appointmentId}`),
  getById: (id: string): Promise<unknown> =>
    api.get(`/prescriptions/${id}`),
  create: (data: unknown): Promise<unknown> =>
    api.post('/prescriptions', data),
  update: (id: string, data: unknown): Promise<unknown> =>
    api.put(`/prescriptions/${id}`, data),
  delete: (id: string): Promise<void> =>
    api.delete(`/prescriptions/${id}`) as unknown as Promise<void>,
};

export const serviceApiService = {
  getAll: (params?: PaginationQuery): Promise<unknown> =>
    api.get('/services', { params }),
  create: (data: unknown): Promise<unknown> =>
    api.post('/services', data),
  update: (id: string, data: unknown): Promise<unknown> =>
    api.put(`/services/${id}`, data),
  delete: (id: string): Promise<void> =>
    api.delete(`/services/${id}`) as unknown as Promise<void>,
};

export const departmentService = {
  getAll: (): Promise<unknown> =>
    api.get('/departments'),
  create: (data: unknown): Promise<unknown> =>
    api.post('/departments', data),
  update: (id: string, data: unknown): Promise<unknown> =>
    api.put(`/departments/${id}`, data),
  delete: (id: string): Promise<void> =>
    api.delete(`/departments/${id}`) as unknown as Promise<void>,
};

export { api };
