import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { appointmentService, patientService, doctorService, paymentService } from '../services/clinicApi';
import { MdPeople, MdLocalHospital, MdCalendarToday, MdPayment, MdTrendingUp } from 'react-icons/md';
import type { Appointment, PaginationMeta } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  color: string;
  iconBg: string;
}

const StatCard = ({ icon, label, value, color, iconBg }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    <div className="stat-body">
      <h3 style={{ color }}>{value ?? <span className="skeleton" style={{ width: 60, height: 28, display: 'block' }} />}</h3>
      <p>{label}</p>
    </div>
  </div>
);


interface DashboardStats {
  patients?: number;
  doctors?: number;
  appointments?: number;
  payments?: number;
}

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [stats, setStats] = useState<DashboardStats>({});
  const [recent, setRecent] = useState<Appointment[]>([]);

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
          patients: (patients.meta as PaginationMeta)?.total,
          doctors:  (doctors.meta as PaginationMeta)?.total,
          appointments: (appts.meta as PaginationMeta)?.total,
          payments: (payments.meta as PaginationMeta)?.total,
        });
        setRecent(appts.data || []);
      } catch {}
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Boshqaruv Paneli</h2>
          <p>Qaytdingiz, {user?.email}. Bugun qandaydir yangiliklar.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon={<MdPeople />} 
          label={user?.role === 'doctor' ? 'Mening Bemorlarim' : 'Jami Bemorlar'} 
          value={stats.patients} 
          color="#4f6ef7" 
          iconBg="rgba(79,110,247,0.15)" 
        />
        
        {user?.role === 'admin' && (
          <StatCard 
            icon={<MdLocalHospital />} 
            label="Jami Doktorlar" 
            value={stats.doctors} 
            color="#10b981" 
            iconBg="rgba(16,185,129,0.15)" 
          />
        )}

        <StatCard 
          icon={<MdCalendarToday />} 
          label={user?.role === 'doctor' ? 'Mening Turnilarim' : 'Jami Turnilar'} 
          value={stats.appointments} 
          color="#f59e0b" 
          iconBg="rgba(245,158,11,0.15)" 
        />

        {(user?.role === 'admin' || user?.role === 'cashier') && (
          <StatCard 
            icon={<MdPayment />} 
            label="Jami To'lovlar" 
            value={stats.payments} 
            color="#3b82f6" 
            iconBg="rgba(59,130,246,0.15)" 
          />
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <MdTrendingUp style={{ color: 'var(--primary)', fontSize: '1.3rem' }} />
          <h3 style={{ fontSize: '1rem' }}>
            {user?.role === 'doctor' ? 'Mening Oxirgi Turnilarim' : 'Oxirgi Turnilar'}
          </h3>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bemor</th>
                {user?.role !== 'doctor' && <th>Doktor</th>}
                <th>Sana</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {recent.length > 0
                ? recent.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.patient_name}</td>
                    {user?.role !== 'doctor' && <td>{r.doctor_name}</td>}
                    <td>{r.appt_date}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))
                : (
                  <tr>
                    <td colSpan={user?.role === 'doctor' ? 3 : 4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                      Turni topilmadi
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
