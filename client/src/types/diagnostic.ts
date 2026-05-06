export interface Diagnostic {
  id: string;
  appointment_id: string;
  description: string;
  diagnosed_at: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticFormData {
  appointment_id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  notes?: string;
}
