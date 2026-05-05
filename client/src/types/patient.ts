export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  insurance_id?: string;
  blood_type?: BloodType;
  created_at?: string;
}

export type Gender = 'male' | 'female' | 'other';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const GENDERS: readonly Gender[] = ['male', 'female', 'other'] as const;

export const BLOOD_TYPES: readonly BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  insurance_id: string;
  blood_type: string;
}

export const defaultPatientForm: PatientFormData = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'male',
  phone: '',
  email: '',
  address: '',
  emergency_contact: '',
  insurance_id: '',
  blood_type: '',
};
