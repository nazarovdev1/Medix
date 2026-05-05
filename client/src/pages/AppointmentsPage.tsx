import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchAppointments,
  createAppointment,
  updateAppointmentStatus,
} from '../features/appointments/appointmentsSlice';
import { patientService, doctorService } from '../services/clinicApi';
import { MdAdd, MdSearch, MdFilterList, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { STATUSES, defaultAppointmentForm } from '../types';
import type {
  Patient,
  Doctor,
  AppointmentFormData,
  AppointmentStatus,
} from '../types';

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  const { items, meta, isLoading } = useAppSelector((s) => s.appointments);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AppointmentFormData>(defaultAppointmentForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    patientService.getAll({ limit: 100 }).then((r) => setPatients(r.data || [])).catch(() => {});
    doctorService.getAll({ limit: 100 }).then((r) => setDoctors(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(fetchAppointments({ page, status: statusFilter || undefined }));
  }, [dispatch, page, statusFilter]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createAppointment(form));
    if (createAppointment.fulfilled.match(result)) {
      toast.success('Turni rejalashtirildi!');
      setShowModal(false);
      setForm(defaultAppointmentForm);
      dispatch(fetchAppointments({ page, status: statusFilter || undefined }));
    } else {
      toast.error(result.payload || 'Rezervatsiya bekor qilindi');
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    const result = await dispatch(updateAppointmentStatus({ id, status }));
    if (updateAppointmentStatus.fulfilled.match(result)) {
      toast.success(`Holat yangilandi: ${status}`);
    } else {
      toast.error(result.payload || 'Yangilashda xatolik');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Turnilar</h2>
          <p>{meta?.total ?? 0} ta turni</p>
        </div>
        <button id="add-appointment-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Turni Rezervatsiya Qilish
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <MdSearch className="search-icon" />
          <input
            id="appt-search"
            className="form-input"
            placeholder="Turnilarni qidirish…"
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
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Barcha Holatlar</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bemor</th><th>Doktor</th><th>Sana</th><th>Holat</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Turni topilmadi</td></tr>
            ) : items.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.patient_name}</td>
                <td>{a.doctor_name}</td>
                <td>{a.appt_date}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                    className="form-select"
                    style={{ width: 140 }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev}>‹</button>
          {Array.from({ length: meta.totalPages }, (_, i) => (
            <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
          ))}
          <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>›</button>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Turni Rezervatsiya Qilish</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Bemor</label>
                <select name="patient_id" className="form-select" value={form.patient_id} onChange={handleChange} required>
                  <option value="">— Bemor tanlang —</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doktor</label>
                <select name="doctor_id" className="form-select" value={form.doctor_id} onChange={handleChange} required>
                  <option value="">— Doktor tanlang —</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.speciality}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Turni Sanagi</label>
                <input name="appt_date" type="datetime-local" className="form-input" value={form.appt_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tavsif</label>
                <textarea name="notes" className="form-textarea" value={form.notes} onChange={handleChange} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
