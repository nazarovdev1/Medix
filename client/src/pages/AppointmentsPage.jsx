import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointments,
  createAppointment,
  updateAppointmentStatus,
} from '../features/appointments/appointmentsSlice';
import { patientService, doctorService } from '../services/clinicApi';
import { MdAdd, MdSearch, MdFilterList, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const STATUSES = ['scheduled','confirmed','in_progress','completed','cancelled','no_show'];

const defaultForm = {
  patient_id: '', doctor_id: '', appt_date: '', appt_time: '09:00', reason: '', notes: '',
};

export default function AppointmentsPage() {
  const dispatch = useDispatch();
  const { items, meta, isLoading } = useSelector((s) => s.appointments);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(defaultForm);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [patients, setPatients]   = useState([]);
  const [doctors,  setDoctors]    = useState([]);

  // Load patients + doctors for dropdowns
  useEffect(() => {
    patientService.getAll({ limit: 100 }).then((r) => setPatients(r.data || [])).catch(() => {});
    doctorService.getAll({ limit: 100 }).then((r) => setDoctors(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(fetchAppointments({ page, status: statusFilter || undefined }));
  }, [dispatch, page, statusFilter]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createAppointment(form));
    if (createAppointment.fulfilled.match(result)) {
      toast.success('Appointment scheduled!');
      setShowModal(false);
      setForm(defaultForm);
      dispatch(fetchAppointments({ page, status: statusFilter || undefined }));
    } else {
      toast.error(result.payload || 'Booking failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    const result = await dispatch(updateAppointmentStatus({ id, status }));
    if (updateAppointmentStatus.fulfilled.match(result)) {
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Appointments</h2>
          <p>{meta?.total ?? 0} total appointments</p>
        </div>
        <button id="add-appointment-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Book Appointment
        </button>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────── */}
      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <MdSearch className="search-icon" />
          <input
            id="appt-search"
            className="form-input"
            placeholder="Search appointments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdFilterList style={{ color: 'var(--text-muted)' }} />
          <select
            id="appt-status-filter"
            className="form-select"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────── */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th><th>Doctor</th><th>Date</th>
              <th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No appointments found</td></tr>
            ) : items.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>Dr. {a.doctor_name}</td>
                <td>{a.appt_date?.slice(0, 10)}</td>
                <td style={{ fontFamily: 'monospace' }}>{a.appt_time?.slice(0, 5)}</td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.reason || '—'}
                </td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                <td>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.78rem', padding: '5px 8px', width: 140 }}
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta?.totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev}>‹</button>
            {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => (
              <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>›</button>
          </div>
        )}
      </div>

      {/* ─── Book Appointment Modal ──────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book New Appointment</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select id="appt-patient" name="patient_id" className="form-select" value={form.patient_id} onChange={handleChange} required>
                  <option value="">Select patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select id="appt-doctor" name="doctor_id" className="form-select" value={form.doctor_id} onChange={handleChange} required>
                  <option value="">Select doctor…</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} — {d.speciality}</option>
                  ))}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input id="appt-date" name="appt_date" type="date" className="form-input" value={form.appt_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input id="appt-time" name="appt_time" type="time" className="form-input" value={form.appt_time} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea id="appt-reason" name="reason" className="form-textarea" rows={2} value={form.reason} onChange={handleChange} placeholder="Chief complaint or visit reason…" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea name="notes" className="form-textarea" rows={2} value={form.notes} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="appt-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Booking…' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
