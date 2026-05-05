export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  speciality: string;
  email: string;
  license_no: string;
  department_id?: string;
  department_name?: string;
  schedule_id?: string;
  created_at?: string;
}

export interface DoctorFormData {
  first_name: string;
  last_name: string;
  speciality: string;
  email: string;
  license_no: string;
  department_id: string;
  schedule_id: string;
}

export const defaultDoctorForm: DoctorFormData = {
  first_name: '',
  last_name: '',
  speciality: '',
  email: '',
  license_no: '',
  department_id: '',
  schedule_id: '',
};
