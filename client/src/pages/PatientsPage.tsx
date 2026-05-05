import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '../features/patients/patientsSlice';
import { MdAdd, MdSearch, MdDelete, MdEdit, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { GENDERS, BLOOD_TYPES, defaultPatientForm } from '../types';
import type { Patient, PatientFormData } from '../types';

export default function PatientsPage() {
  const dispatch = useAppDispatch();
  const { items, meta, isLoading } = useAppSelector((s) => s.patients);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PatientFormData>(defaultPatientForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPatients({ page, search }));
  }, [dispatch, page, search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (p: Patient) => {
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
    setForm(defaultPatientForm);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let result;
    if (editingId) {
      result = await dispatch(updatePatient({ id: editingId, data: form }));
    } else {
      result = await dispatch(createPatient(form));
    }

    if (createPatient.fulfilled.match(result) || updatePatient.fulfilled.match(result)) {
      toast.success(editingId ? 'Bemor yangilandi!' : 'Bemor yaratildi!');
      setShowModal(false);
      setForm(defaultPatientForm);
      setEditingId(null);
    } else toast.error(result.payload || 'Muvaffaqiyatsiz');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bemorni o'chirishni xohlaysizmi?`)) return;
    const result = await dispatch(deletePatient(id));
    if (deletePatient.fulfilled.match(result)) toast.success('Bemor o\'chirildi');
    else toast.error(result.payload || 'Muvaffaqiyatsiz');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Bemorlar</h2>
          <p>{meta?.total ?? 0} ta ro'yxatdan o'tgan bemor</p>
        </div>
        <button id="add-patient-btn" className="btn btn-primary" onClick={handleAdd}>
          <MdAdd /> Bemor Qo'shish
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <MdSearch className="search-icon" />
          <input id="patient-search" className="form-input" placeholder="Ism yoki email bo'yicha qidirish…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ism</th><th>Jins</th><th>Tug'ilgan sana</th><th>Telefon</th>
              <th>Email</th><th>Qon gruppasi</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Bemor topilmadi</td></tr>
            ) : items.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                <td>{p.gender === 'male' ? 'Erkak' : p.gender === 'female' ? 'Ayol' : p.gender}</td>
                <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('uz-UZ') : '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.phone || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.email || '—'}</td>
                <td><span className="badge">{p.blood_type || '—'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary btn-icon" title="Tahrirlash" onClick={() => handleEdit(p)}><MdEdit /></button>
                    <button className="btn btn-sm btn-danger btn-icon" title="O'chirish" onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}><MdDelete /></button>
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
              <h3 className="modal-title">{editingId ? 'Bemorni Tahrirlash' : "Bemor Qo'shish"}</h3>
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
                  <label className="form-label">Tug'ilgan Sana</label>
                  <input name="date_of_birth" type="date" className="form-input" value={form.date_of_birth} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Jins</label>
                  <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                    {GENDERS.map((g) => <option key={g} value={g}>{g === 'male' ? 'Erkak' : g === 'female' ? 'Ayol' : g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input name="phone" className="form-input" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Manzil</label>
                <textarea name="address" className="form-textarea" value={form.address} onChange={handleChange} rows={2} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Favqulodda Aloqa</label>
                  <input name="emergency_contact" className="form-input" value={form.emergency_contact} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sug'urta ID</label>
                  <input name="insurance_id" className="form-input" value={form.insurance_id} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Qon Gruppasi</label>
                <select name="blood_type" className="form-select" value={form.blood_type} onChange={handleChange}>
                  <option value="">—</option>
                  {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
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
