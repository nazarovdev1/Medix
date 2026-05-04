import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, createDoctor } from '../features/doctors/doctorsSlice';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCalendarToday, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const defaultForm = {
  first_name: '', last_name: '', speciality: '', email: '',
  license_no: '', department_id: '', schedule_id: '',
};

export default function DoctorsPage() {
  const dispatch = useDispatch();
  const { items, meta, isLoading } = useSelector((s) => s.doctors);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [page, setPage]   = useState(1);

  useEffect(() => {
    dispatch(fetchDoctors({ page, search }));
  }, [dispatch, page, search]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createDoctor(form));
    if (createDoctor.fulfilled.match(result)) {
      toast.success('Doctor registered!');
      setShowModal(false);
      setForm(defaultForm);
    } else toast.error(result.payload || 'Failed');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Doctors</h2>
          <p>{meta?.total ?? 0} doctors on staff</p>
        </div>
        <button id="add-doctor-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Add Doctor
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <MdSearch className="search-icon" />
          <input
            id="doctor-search"
            className="form-input"
            placeholder="Search by name or speciality…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Speciality</th><th>Email</th>
              <th>License No.</th><th>Department</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No doctors found</td></tr>
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
                    <button className="btn btn-sm btn-secondary btn-icon" title="Edit"><MdEdit /></button>
                    <button className="btn btn-sm btn-danger btn-icon" title="Delete"><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta?.totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev}>‹</button>
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>›</button>
          </div>
        )}
      </div>

      {/* ─── Add Doctor Modal ──────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Doctor</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input id="doc-first" name="first_name" className="form-input" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input id="doc-last" name="last_name" className="form-input" value={form.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Speciality *</label>
                <input id="doc-speciality" name="speciality" className="form-input" placeholder="e.g. Cardiology" value={form.speciality} onChange={handleChange} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input id="doc-email" name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">License No. *</label>
                  <input id="doc-license" name="license_no" className="form-input" placeholder="LIC-2024-XXX" value={form.license_no} onChange={handleChange} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="doc-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving…' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
