export type { User, UserRole, LoginCredentials, RegisterData, AuthResponse } from './auth';
export type {
  Patient,
  PatientFormData,
  Gender,
  BloodType,
} from './patient';
export { GENDERS, BLOOD_TYPES, defaultPatientForm } from './patient';
export type { Doctor, DoctorFormData } from './doctor';
export { defaultDoctorForm } from './doctor';
export type {
  Appointment,
  AppointmentFormData,
  AppointmentStatus,
} from './appointment';
export { STATUSES, defaultAppointmentForm } from './appointment';
export type {
  Payment,
  PaymentFormData,
  PaymentStatus,
  PaymentMethod,
} from './payment';
export { PAYMENT_STATUSES, PAYMENT_METHODS, defaultPaymentForm } from './payment';
export type { PaginationMeta, PaginatedResponse, PaginationQuery } from './api';
