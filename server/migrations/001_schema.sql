-- ============================================================
-- CLINIC MANAGEMENT SYSTEM — PostgreSQL Schema
-- Version: 1.0.0 | Production Ready
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    description   TEXT,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_name ON departments(name);

-- ============================================================
-- DOCTOR SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    slot_duration INT NOT NULL DEFAULT 30, -- minutes
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time)
);

-- ============================================================
-- USERS (Auth layer)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'patient'
                        CHECK (role IN ('admin', 'doctor', 'patient')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_token   TEXT,
    last_login_at   TIMESTAMPTZ,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    date_of_birth      DATE NOT NULL,
    gender             VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    phone              VARCHAR(20),
    email              VARCHAR(255) UNIQUE,
    address            TEXT,
    emergency_contact  VARCHAR(255),
    insurance_id       VARCHAR(100),
    blood_type         VARCHAR(5),
    is_deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id    ON patients(user_id);
CREATE INDEX idx_patients_last_name  ON patients(last_name);
CREATE INDEX idx_patients_email      ON patients(email);

-- ============================================================
-- DOCTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    speciality    VARCHAR(150) NOT NULL,
    email         VARCHAR(255) UNIQUE,
    license_no    VARCHAR(100) NOT NULL UNIQUE,
    schedule_id   UUID REFERENCES doctor_schedules(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_user_id       ON doctors(user_id);
CREATE INDEX idx_doctors_department_id ON doctors(department_id);
CREATE INDEX idx_doctors_speciality    ON doctors(speciality);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    base_cost     NUMERIC(12, 2) NOT NULL CHECK (base_cost >= 0),
    department    VARCHAR(150),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_name ON services(name);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    appt_date     DATE NOT NULL,
    appt_time     TIME NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled','confirmed','in_progress','completed','cancelled','no_show')),
    reason        TEXT,
    notes         TEXT,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent double-booking: same doctor, same date+time
CREATE UNIQUE INDEX idx_appointments_no_double_book
    ON appointments(doctor_id, appt_date, appt_time)
    WHERE is_deleted = FALSE AND status NOT IN ('cancelled','no_show');

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id  ON appointments(doctor_id);
CREATE INDEX idx_appointments_date       ON appointments(appt_date);
CREATE INDEX idx_appointments_status     ON appointments(status);

-- ============================================================
-- APPOINTMENT SERVICES (Many-to-Many Junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment_services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    quantity        SMALLINT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price      NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    discount_pct    NUMERIC(5, 2) NOT NULL DEFAULT 0
                        CHECK (discount_pct BETWEEN 0 AND 100),
    line_total      NUMERIC(12, 2) GENERATED ALWAYS AS
                        (unit_price * quantity * (1 - discount_pct / 100)) STORED,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appt_svc_appointment_id ON appointment_services(appointment_id);
CREATE INDEX idx_appt_svc_service_id     ON appointment_services(service_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE RESTRICT,
    amount          NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method  VARCHAR(30) NOT NULL
                        CHECK (payment_method IN ('cash','card','insurance','online','other')),
    payment_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    receipt_number  VARCHAR(100) UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','paid','partial','refunded','failed')),
    notes           TEXT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status         ON payments(status);
CREATE INDEX idx_payments_date           ON payments(payment_date);

-- ============================================================
-- DIAGNOSTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnostics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    description     TEXT NOT NULL,
    diagnosed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity        VARCHAR(20) NOT NULL DEFAULT 'mild'
                        CHECK (severity IN ('mild','moderate','severe','critical')),
    notes           TEXT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnostics_appointment_id ON diagnostics(appointment_id);
CREATE INDEX idx_diagnostics_severity       ON diagnostics(severity);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    medication_name     VARCHAR(200) NOT NULL,
    dosage              VARCHAR(100) NOT NULL,
    frequency           VARCHAR(150) NOT NULL,   -- e.g. "3 times a day with meals"
    duration_days       SMALLINT NOT NULL CHECK (duration_days > 0),
    issued_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    pharmacy            VARCHAR(200),
    notes               TEXT,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_appointment_id ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_medication     ON prescriptions(medication_name);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name    VARCHAR(100) NOT NULL,
    record_id     UUID,
    action        VARCHAR(10) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE','SELECT')),
    changed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address    INET,
    old_values    JSONB,
    new_values    JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table   ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_user    ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_date    ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action  ON audit_logs(action);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'departments','doctor_schedules','users','patients',
        'doctors','services','appointments','appointment_services',
        'payments','diagnostics','prescriptions'
    ]
    LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$;
