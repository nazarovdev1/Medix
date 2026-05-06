-- Update users role constraint to include cashier
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'doctor', 'patient', 'cashier'));
