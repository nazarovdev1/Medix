import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logoutUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import {
  MdDashboard, MdPeople, MdLocalHospital, MdCalendarToday,
  MdPayment, MdScience, MdDescription, MdLogout,
  MdMedicalServices, MdHealthAndSafety, MdAdminPanelSettings,
} from 'react-icons/md';

type UserRole = 'admin' | 'doctor' | 'cashier';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  section: 'main' | 'clinic' | 'admin';
}

const navItems: NavItem[] = [
  // Main section
  { to: '/',             label: 'Boshqaruv Paneli', icon: <MdDashboard />,         roles: ['admin','doctor','cashier'], section: 'main' },
  { to: '/patients',     label: 'Bemorlar',         icon: <MdPeople />,            roles: ['admin','doctor','cashier'], section: 'main' },
  { to: '/appointments', label: 'Turnilar',         icon: <MdCalendarToday />,     roles: ['admin','doctor'],           section: 'main' },
  { to: '/payments',     label: "To'lovlar",        icon: <MdPayment />,           roles: ['admin','cashier'],          section: 'main' },
  // Clinic section
  { to: '/services',     label: 'Xizmatlar',        icon: <MdMedicalServices />,   roles: ['admin','doctor','cashier'], section: 'clinic' },
  { to: '/diagnostics',  label: 'Diagnostika',      icon: <MdScience />,           roles: ['admin','doctor'],           section: 'clinic' },
  { to: '/prescriptions',label: 'Dori Reseptlari',  icon: <MdDescription />,       roles: ['admin','doctor'],           section: 'clinic' },
  // Admin section
  { to: '/doctors',      label: 'Doktorlar',        icon: <MdLocalHospital />,     roles: ['admin'],                    section: 'admin' },
  { to: '/departments',  label: "Bo'limlar",        icon: <MdHealthAndSafety />,   roles: ['admin'],                    section: 'admin' },
  { to: '/audit-logs',   label: 'Audit Loglar',     icon: <MdAdminPanelSettings />,roles: ['admin'],                    section: 'admin' },
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

  const role = (user?.role ?? 'cashier') as UserRole;

  const mainItems   = navItems.filter(i => i.section === 'main'   && i.roles.includes(role));
  const clinicItems = navItems.filter(i => i.section === 'clinic'  && i.roles.includes(role));
  const adminItems  = navItems.filter(i => i.section === 'admin'   && i.roles.includes(role));

  const renderLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      <span className="nav-icon">{item.icon}</span>
      {item.label}
    </NavLink>
  );

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ fontSize: '1.75rem', color: 'var(--primary-light)' }}>
            <MdHealthAndSafety />
          </div>
          <h1>Medix</h1>
        </div>

        <nav className="sidebar-nav">
          {mainItems.length > 0 && (
            <>
              <div className="nav-section-title">Asosiy Menyu</div>
              {mainItems.map(renderLink)}
            </>
          )}

          {clinicItems.length > 0 && (
            <>
              <div className="nav-section-title" style={{ marginTop: 16 }}>Klinik</div>
              {clinicItems.map(renderLink)}
            </>
          )}

          {adminItems.length > 0 && (
            <>
              <div className="nav-section-title" style={{ marginTop: 16 }}>Boshqaruv</div>
              {adminItems.map(renderLink)}
            </>
          )}
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
