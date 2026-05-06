export interface Payment {
  id: string;
  appointment_id: string;
  patient_name?: string;
  appt_date?: string;
  appt_time?: string;
  amount: number | string;
  payment_method: PaymentMethod;
  receipt_number?: string;
  payment_date?: string;
  status: PaymentStatus;
  created_at?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';

export type PaymentMethod = 'cash' | 'card' | 'insurance' | 'online' | 'other';

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'pending',
  'paid',
  'partial',
  'refunded',
  'failed',
] as const;

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'cash',
  'card',
  'insurance',
  'online',
  'other',
] as const;

export interface PaymentFormData {
  appointment_id: string;
  payment_method: PaymentMethod;
  amount: number;
  notes: string;
}

export const defaultPaymentForm: PaymentFormData = {
  appointment_id: '',
  payment_method: 'card',
  amount: 0,
  notes: '',
};
