import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import {
  MdDashboard, MdPeople, MdLocalHospital, MdCalendarToday,
  MdPayment, MdScience, MdDescription, MdLogout,
  MdMedicalServices, MdHealthAndSafety,
} from 'react-icons/md';

const navItems = [
  { to: '/',             label: 'Dashboard',    icon: <MdDashboard /> },
  { to: '/patients',     label: 'Patients',     icon: <MdPeople /> },
  { to: '/doctors',      label: 'Doctors',      icon: <MdLocalHospital /> },
  { to: '/appointments', label: 'Appointments', icon: <MdCalendarToday /> },
  { to: '/payments',     label: 'Payments',     icon: <MdPayment /> },
];

export default function DashboardLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ fontSize: '1.75rem', color: 'var(--primary-light)' }}><MdHealthAndSafety /></div>
          <h1>Medix</h1>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
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

          <div className="nav-section-title" style={{ marginTop: 16 }}>Clinical</div>
          <NavLink to="/services"     className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><MdMedicalServices /></span> Services
          </NavLink>
          <NavLink to="/diagnostics"  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><MdScience /></span> Diagnostics
          </NavLink>
          <NavLink to="/prescriptions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><MdDescription /></span> Prescriptions
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(79,110,247,0.08)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-light)', marginTop: 2 }}>{user.email}</div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>{user.role}</div>
            </div>
          )}
          <button className="nav-item btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'flex-start' }}>
            <span className="nav-icon"><MdLogout /></span> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
