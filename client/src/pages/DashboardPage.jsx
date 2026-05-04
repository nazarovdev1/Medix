import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { appointmentService, patientService, doctorService, paymentService } from '../services/clinicApi';
import { MdPeople, MdLocalHospital, MdCalendarToday, MdPayment, MdTrendingUp } from 'react-icons/md';

const StatCard = ({ icon, label, value, color, iconBg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    <div className="stat-body">
      <h3 style={{ color }}>{value ?? <span className="skeleton" style={{ width: 60, height: 28, display: 'block' }} />}</h3>
      <p>{label}</p>
    </div>
  </div>
);

const RecentRow = ({ item }) => (
  <tr>
    <td style={{ fontWeight: 500 }}>{item.patient_name}</td>
    <td>{item.doctor_name}</td>
    <td>{item.appt_date}</td>
    <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
  </tr>
);

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [patients, doctors, appts, payments] = await Promise.all([
          patientService.getAll({ limit: 1 }),
          doctorService.getAll({ limit: 1 }),
          appointmentService.getAll({ limit: 5, sortBy: 'appt_date', sortDir: 'desc' }),
          paymentService.getAll({ limit: 1 }),
        ]);
        setStats({
          patients: patients.meta?.total,
          doctors:  doctors.meta?.total,
          appointments: appts.meta?.total,
          payments: payments.meta?.total,
        });
        setRecent(appts.data || []);
      } catch (_) {}
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back, {user?.email}. Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<MdPeople />}          label="Total Patients"      value={stats.patients}     color="#4f6ef7" iconBg="rgba(79,110,247,0.15)" />
        <StatCard icon={<MdLocalHospital />}   label="Total Doctors"       value={stats.doctors}      color="#10b981" iconBg="rgba(16,185,129,0.15)" />
        <StatCard icon={<MdCalendarToday />}   label="Total Appointments"  value={stats.appointments} color="#f59e0b" iconBg="rgba(245,158,11,0.15)" />
        <StatCard icon={<MdPayment />}         label="Total Payments"      value={stats.payments}     color="#3b82f6" iconBg="rgba(59,130,246,0.15)" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <MdTrendingUp style={{ color: 'var(--primary)', fontSize: '1.3rem' }} />
          <h3 style={{ fontSize: '1rem' }}>Recent Appointments</h3>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length > 0
                ? recent.map((r) => <RecentRow key={r.id} item={r} />)
                : <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No appointments yet</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
