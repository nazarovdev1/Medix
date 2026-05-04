import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

import { MdHealthAndSafety } from 'react-icons/md';

export default function LoginPage() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const dispatch          = useDispatch();
  const navigate          = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon-lg" style={{ color: 'var(--primary-light)' }}><MdHealthAndSafety /></div>
          <h1>Medix</h1>
          <p>Clinic Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="doctor@clinick.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={isLoading}>
            {isLoading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(79,110,247,0.07)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Demo credentials:</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin: admin@clinick.com / Password123!</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Doctor: dr.smith@clinick.com / Password123!</p>
          </div>
        </form>
      </div>
    </div>
  );
}
