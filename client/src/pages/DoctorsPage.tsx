import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchDoctors, createDoctor } from '../features/doctors/doctorsSlice';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCalendarToday, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { defaultDoctorForm } from '../types';
import type { DoctorFormData } from '../types';

export default function DoctorsPage() {
  const dispatch = useAppDispatch();
  const { items, meta, isLoading } = useAppSelector((s) => s.doctors);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DoctorFormData>(defaultDoctorForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDoctors({ page, search }));
  }, [dispatch, page, search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createDoctor(form));
    if (createDoctor.fulfilled.match(result)) {
      toast.success('Doktor ro\'yxatdan o\'tkazildi!');
      setShowModal(false);
      setForm(defaultDoctorForm);
    } else toast.error(result.payload || 'Muvaffaqiyatsiz');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Doktorlar</h2>
          <p>{meta?.total ?? 0} ta xodimdor doktor</p>
        </div>
        <button id="add-doctor-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Doktor Qo'shish
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <MdSearch className="search-icon" />
          <input
            id="doctor-search"
            className="form-input"
            placeholder="Ism yoki mutaxassislik bo'yicha qidirish…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ism</th><th>Mutaxassislik</th><th>Email</th>
              <th>Litsenziya No.</th><th>Bo'lim</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Doktor topilmadi</td></tr>
            ) : items.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>Dr. {d.first_name} {d.last_name}</td>
                <td><span className="badge badge-confirmed">{d.speciality}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.email}</td>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.license_no}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.department_name || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary btn-icon" title="Schedule"><MdCalendarToday /></button>
                    <button className="btn btn-sm btn-secondary btn-icon" title="Tahrirlash"><MdEdit /></button>
                    <button className="btn btn-sm btn-danger btn-icon" title="O'chirish"><MdDelete /></button>
                  </div>
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
              <h3 className="modal-title">Doktor Qo'shish</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <input name="first_name" className="form-input" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <input name="last_name" className="form-input" value={form.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mutaxassislik</label>
                  <input name="speciality" className="form-input" value={form.speciality} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Litsenziya Raqami</label>
                  <input name="license_no" className="form-input" value={form.license_no} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bo'lim</label>
                  <input name="department_id" className="form-input" value={form.department_id} onChange={handleChange} />
                </div>
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
