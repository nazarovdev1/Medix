import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import type { LoginCredentials } from '../types';
import { MdHealthAndSafety } from 'react-icons/md';

export default function LoginPage() {
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Qaytdingiz!');
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon-lg" style={{ color: 'var(--primary-light)' }}><MdHealthAndSafety /></div>
          <h1>Medix</h1>
          <p>Klinika Boshqaruv Tizimi</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Manzili</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="doktor@kasalxonacha.uz"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
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
            {isLoading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Kirish...</> : 'Kirish'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
          </p>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(79,110,247,0.07)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Demo ma'lumotlar:</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin: admin@clinick.com / Password123!</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Doctor: dr.smith@clinick.com / Password123!</p>
          </div>
        </form>
      </div>
    </div>
  );
}
