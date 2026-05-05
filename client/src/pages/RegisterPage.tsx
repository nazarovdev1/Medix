import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import type { RegisterData } from '../types';
import { MdHealthAndSafety } from 'react-icons/md';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient' as const,
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Hisob yaratildi! Kirish uchun tizimga kiring.');
      navigate('/login');
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

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Ism</label>
              <input
                id="register-firstName"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="Ismingiz"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Familiya</label>
              <input
                id="register-lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Familiyangiz"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Manzili</label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="siz@kasalxonacha.uz"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              id="register-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              id="register-role"
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="patient">Bemor</option>
              <option value="doctor">Doktor</option>
            </select>
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={isLoading}>
            {isLoading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Ro'yxatdan o'tkazilmoqda...</> : 'Ro\'yxatdan o\'tish'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Hisobingiz bormi? <Link to="/login">Kirish</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
