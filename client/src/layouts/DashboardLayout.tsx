import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logoutUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import {
  MdDashboard, MdPeople, MdLocalHospital, MdCalendarToday,
  MdPayment, MdScience, MdDescription, MdLogout,
  MdMedicalServices, MdHealthAndSafety,
} from 'react-icons/md';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/',             label: 'Boshqaruv Paneli',    icon: <MdDashboard /> },
  { to: '/patients',     label: 'Bemorlar',            icon: <MdPeople /> },
  { to: '/doctors',      label: 'Doktorlar',           icon: <MdLocalHospital /> },
  { to: '/appointments', label: 'Turnilar',            icon: <MdCalendarToday /> },
  { to: '/payments',     label: 'To\'lovlar',          icon: <MdPayment /> },
];

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Chiqildi');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ fontSize: '1.75rem', color: 'var(--primary-light)' }}><MdHealthAndSafety /></div>
          <h1>Medix</h1>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Asosiy Menyu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: 16 }}>Klinik</div>
          <NavLink to="/services"     className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><MdMedicalServices /></span> Xizmatlar
          </NavLink>
          <NavLink to="/diagnostics"  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><MdScience /></span> Diagnostika
          </NavLink>
          <NavLink to="/prescriptions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><MdDescription /></span> Dori Reseptlari
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(79,110,247,0.08)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kirib bo'lgan foydalanuvchi</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-light)', marginTop: 2 }}>{user.email}</div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>{user.role}</div>
            </div>
          )}
          <button className="nav-item btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'flex-start' }}>
            <span className="nav-icon"><MdLogout /></span> Chiqish
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
