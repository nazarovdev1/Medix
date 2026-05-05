export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  appt_date: string;
  appt_time: string;
  reason?: string;
  notes?: string;
  status: AppointmentStatus;
  created_at?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export const STATUSES: readonly AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const;

export interface AppointmentFormData {
  patient_id: string;
  doctor_id: string;
  appt_date: string;
  appt_time: string;
  reason: string;
  notes: string;
}

export const defaultAppointmentForm: AppointmentFormData = {
  patient_id: '',
  doctor_id: '',
  appt_date: '',
  appt_time: '09:00',
  reason: '',
  notes: '',
};
