import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

import { MdHealthAndSafety } from 'react-icons/md';

export default function RegisterPage() {
  const [form, setForm]   = useState({ email: '', password: '', role: 'patient' });
  const dispatch          = useDispatch();
  const navigate          = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please login.');
      navigate('/login');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon-lg" style={{ color: 'var(--primary-light)' }}><MdHealthAndSafety /></div>
          <h1>Create Account</h1>
          <p>Join the Medix platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" name="password" type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={handleChange} minLength={8} required />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select id="reg-role" name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={isLoading}>
            {isLoading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...</> : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
