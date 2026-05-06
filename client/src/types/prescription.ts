export interface Prescription {
  id: string;
  appointment_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  issued_date: string;
  pharmacy?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionFormData {
  appointment_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  pharmacy?: string;
  notes?: string;
}
