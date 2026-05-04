import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '../features/patients/patientsSlice';
import { MdAdd, MdSearch, MdDelete, MdEdit, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const GENDERS = ['male', 'female', 'other'];
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const defaultForm = {
  first_name: '', last_name: '', date_of_birth: '', gender: 'male',
  phone: '', email: '', address: '', emergency_contact: '', insurance_id: '', blood_type: '',
};

export default function PatientsPage() {
  const dispatch = useDispatch();
  const { items, meta, isLoading } = useSelector((s) => s.patients);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPatients({ page, search }));
  }, [dispatch, page, search]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      date_of_birth: p.date_of_birth ? p.date_of_birth.slice(0, 10) : '',
      gender: p.gender || 'male',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      emergency_contact: p.emergency_contact || '',
      insurance_id: p.insurance_id || '',
      blood_type: p.blood_type || '',
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (editingId) {
      result = await dispatch(updatePatient({ id: editingId, data: form }));
    } else {
      result = await dispatch(createPatient(form));
    }

    if (createPatient.fulfilled.match(result) || updatePatient.fulfilled.match(result)) {
      toast.success(editingId ? 'Patient updated!' : 'Patient created!');
      setShowModal(false);
      setForm(defaultForm);
      setEditingId(null);
    } else toast.error(result.payload || 'Failed');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient ${name}?`)) return;
    const result = await dispatch(deletePatient(id));
    if (deletePatient.fulfilled.match(result)) toast.success('Patient deleted');
    else toast.error(result.payload || 'Failed');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>{meta?.total ?? 0} total patients registered</p>
        </div>
        <button id="add-patient-btn" className="btn btn-primary" onClick={handleAdd}>
          <MdAdd /> Add Patient
        </button>
      </div>

      {/* ─── Filter Bar ───────────────────────────────── */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <MdSearch className="search-icon" />
          <input id="patient-search" className="form-input" placeholder="Search by name or email…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────── */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Gender</th><th>DOB</th><th>Phone</th>
              <th>Email</th><th>Blood</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No patients found</td></tr>
            ) : items.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                <td><span className={`badge badge-${p.gender === 'male' ? 'scheduled' : 'confirmed'}`}>{p.gender}</span></td>
                <td>{p.date_of_birth?.slice(0,10)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.phone || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.email || '—'}</td>
                <td>{p.blood_type || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary btn-icon" title="Edit" onClick={() => handleEdit(p)}><MdEdit /></button>
                    <button className="btn btn-sm btn-danger btn-icon" title="Delete" onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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

      {/* ─── Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Patient' : 'Register New Patient'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input id="patient-first" name="first_name" className="form-input" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input id="patient-last" name="last_name" className="form-input" value={form.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input id="patient-dob" name="date_of_birth" type="date" className="form-input" value={form.date_of_birth} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select id="patient-gender" name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" className="form-input" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Blood Type</label>
                  <select name="blood_type" className="form-select" value={form.blood_type} onChange={handleChange}>
                    <option value="">Select</option>
                    {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Insurance ID</label>
                  <input name="insurance_id" className="form-input" value={form.insurance_id} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea name="address" className="form-textarea" value={form.address} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input name="emergency_contact" className="form-input" value={form.emergency_contact} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="patient-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving…' : (editingId ? 'Update Patient' : 'Register Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
