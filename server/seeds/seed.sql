-- ============================================================
-- CLINIC MANAGEMENT SYSTEM — Seed Data
-- ============================================================

-- Departments
INSERT INTO departments (id, name, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Cardiology', 'Heart and cardiovascular system'),
  ('a1000000-0000-0000-0000-000000000002', 'Neurology', 'Brain and nervous system'),
  ('a1000000-0000-0000-0000-000000000003', 'Orthopedics', 'Bones and joints'),
  ('a1000000-0000-0000-0000-000000000004', 'General Medicine', 'General health consultations'),
  ('a1000000-0000-0000-0000-000000000005', 'Pediatrics', 'Child health and development');

-- Doctor Schedules
INSERT INTO doctor_schedules (id, day_of_week, start_time, end_time, slot_duration) VALUES
  ('b1000000-0000-0000-0000-000000000001', 1, '09:00', '17:00', 30),
  ('b1000000-0000-0000-0000-000000000002', 2, '08:00', '16:00', 30),
  ('b1000000-0000-0000-0000-000000000003', 3, '10:00', '18:00', 45),
  ('b1000000-0000-0000-0000-000000000004', 4, '09:00', '15:00', 30);

-- Users (passwords are all "Password123!" hashed with bcrypt)
-- Hash: $2a$12$53xzMkaF.GY7n6Q399b8i.vX6JUThGxn.ARuM3bzBMFOD45i54oKG
INSERT INTO users (id, email, password_hash, role) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'admin@clinick.com',   '$2a$12$53xzMkaF.GY7n6Q399b8i.vX6JUThGxn.ARuM3bzBMFOD45i54oKG', 'admin'),
  ('c1000000-0000-0000-0000-000000000002', 'dr.smith@clinick.com', '$2a$12$53xzMkaF.GY7n6Q399b8i.vX6JUThGxn.ARuM3bzBMFOD45i54oKG', 'doctor'),
  ('c1000000-0000-0000-0000-000000000003', 'dr.jones@clinick.com', '$2a$12$53xzMkaF.GY7n6Q399b8i.vX6JUThGxn.ARuM3bzBMFOD45i54oKG', 'doctor'),
  ('c1000000-0000-0000-0000-000000000004', 'john.doe@email.com',   '$2a$12$53xzMkaF.GY7n6Q399b8i.vX6JUThGxn.ARuM3bzBMFOD45i54oKG', 'patient'),
  ('c1000000-0000-0000-0000-000000000005', 'jane.doe@email.com',   '$2a$12$53xzMkaF.GY7n6Q399b8i.vX6JUThGxn.ARuM3bzBMFOD45i54oKG', 'patient');

-- Doctors
INSERT INTO doctors (id, user_id, first_name, last_name, speciality, email, license_no, schedule_id, department_id) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Robert', 'Smith', 'Cardiology', 'dr.smith@clinick.com', 'LIC-2024-001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'Emily', 'Jones', 'Neurology', 'dr.jones@clinick.com', 'LIC-2024-002', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002');

-- Patients
INSERT INTO patients (id, user_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, insurance_id) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'John', 'Doe', '1985-06-15', 'male', '+1-555-0101', 'john.doe@email.com', '123 Main St, Springfield', 'Jane Doe: +1-555-0102', 'INS-001234'),
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 'Jane', 'Doe', '1990-03-22', 'female', '+1-555-0103', 'jane.doe@email.com', '123 Main St, Springfield', 'John Doe: +1-555-0101', 'INS-005678');

-- Services
INSERT INTO services (id, name, description, base_cost, department) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'ECG', 'Electrocardiogram test', 75.00, 'Cardiology'),
  ('f1000000-0000-0000-0000-000000000002', 'Blood Pressure Check', 'Blood pressure measurement', 25.00, 'General Medicine'),
  ('f1000000-0000-0000-0000-000000000003', 'MRI Brain Scan', 'Magnetic resonance imaging of brain', 450.00, 'Neurology'),
  ('f1000000-0000-0000-0000-000000000004', 'X-Ray', 'Radiographic imaging', 120.00, 'Orthopedics'),
  ('f1000000-0000-0000-0000-000000000005', 'General Consultation', 'Standard doctor consultation', 50.00, 'General Medicine'),
  ('f1000000-0000-0000-0000-000000000006', 'Blood Test Panel', 'Complete blood count + metabolic panel', 95.00, 'General Medicine');

-- Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appt_date, appt_time, status, reason, notes) VALUES
  ('11000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '2026-05-10', '09:00', 'scheduled', 'Chest pain evaluation', 'First visit'),
  ('11000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', '2026-05-11', '10:00', 'scheduled', 'Headaches', 'Recurring migraines'),
  ('11000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '2026-04-15', '11:00', 'completed', 'Annual checkup', NULL);

-- Appointment Services
INSERT INTO appointment_services (appointment_id, service_id, quantity, unit_price, discount_pct) VALUES
  ('11000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 1, 75.00, 0),
  ('11000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 1, 25.00, 0),
  ('11000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000003', 1, 450.00, 10),
  ('11000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000005', 1, 50.00, 0),
  ('11000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000006', 1, 95.00, 5);

-- Payments
INSERT INTO payments (appointment_id, amount, payment_method, receipt_number, status) VALUES
  ('11000000-0000-0000-0000-000000000003', 137.25, 'card', 'REC-2026-001', 'paid');

-- Diagnostics
INSERT INTO diagnostics (appointment_id, description, severity, notes) VALUES
  ('11000000-0000-0000-0000-000000000003', 'Mild hypertension detected. Blood pressure 140/90 mmHg.', 'mild', 'Recommend lifestyle changes and follow-up in 3 months.');

-- Prescriptions
INSERT INTO prescriptions (appointment_id, medication_name, dosage, frequency, duration_days, pharmacy, notes) VALUES
  ('11000000-0000-0000-0000-000000000003', 'Lisinopril', '10mg', 'Once daily in the morning', 90, 'City Pharmacy, Main St', 'Take with water. Monitor blood pressure weekly.');
