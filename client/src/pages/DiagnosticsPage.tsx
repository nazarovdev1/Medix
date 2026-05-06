import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { diagnosticService, appointmentService, patientService } from '../services/clinicApi';
import { MdAdd, MdArrowBack, MdClose, MdScience } from 'react-icons/md';
import toast from 'react-hot-toast';
import type { Appointment, Diagnostic, Patient } from '../types';

export default function DiagnosticsPage() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const [appointment, setAppt] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    description: '',
    severity: 'mild',
    notes: ''
  });

  const loadData = useCallback(async () => {
    if (!appointmentId) return;

    try {
      const [appt, diags] = await Promise.all([
        appointmentService.getById(appointmentId),
        diagnosticService.getByAppointment(appointmentId) as Promise<{ data: Diagnostic[] }>
      ]);
      setAppt(appt);
      setDiagnostics(diags.data || []);
      
      const p = await patientService.getById(appt.patient_id);
      setPatient(p);
    } catch (e) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {

    }
  }, [appointmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;
    try {
      await diagnosticService.create({ ...form, appointment_id: appointmentId });
      toast.success('Diagnostika saqlandi');
      setShowModal(false);
      setForm({ description: '', severity: 'mild', notes: '' });
      loadData();
    } catch (e) {
      toast.error('Saqlashda xatolik');
    }
  };

  if (!appointmentId) {
    return (
      <div className="empty-state">
        <MdScience size={64} color="var(--border)" />
        <h3>Turni tanlanmagan</h3>
        <p>Iltimos, turnilar ro'yxatidan bemorni tanlang.</p>
        <button className="btn btn-primary" onClick={() => navigate('/appointments')}>Turnilar ro'yxati</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate(-1)}>
            <MdArrowBack />
          </button>
          <div>
            <h2>Diagnostika</h2>
            <p>Bemor: {patient ? `${patient.first_name} ${patient.last_name}` : 'Yuklanmoqda...'}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Yangi Diagnostika
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Turni ma'lumotlari</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 12 }}>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Sana va Vaqt</label>
            <p style={{ fontWeight: 500 }}>{appointment?.appt_date} {appointment?.appt_time}</p>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Sabab</label>
            <p style={{ fontWeight: 500 }}>{appointment?.reason || 'Ko\'rsatilmagan'}</p>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Holat</label>
            <span className={`badge badge-${appointment?.status}`}>{appointment?.status}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Diagnostika Tarixi</h3>
        <div className="table-wrapper" style={{ border: 'none', marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tavsif</th>
                <th>Og'irlik darajasi</th>
                <th>Eslatmalar</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    Diagnostika topilmadi
                  </td>
                </tr>
              ) : (
                diagnostics.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.description}</td>
                    <td>
                      <span className={`badge severity-${d.severity}`}>{d.severity}</span>
                    </td>
                    <td>{d.notes}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button className="btn btn-success" onClick={() => navigate(`/prescriptions?appointmentId=${appointmentId}`)}>
          Resept yozish
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
          Turnilar ro'yxati
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Yangi Diagnostika Qo'shish</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Asosiy Tavsif</label>
                <textarea 
                  className="form-textarea" 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})} 
                  required 
                  rows={3} 
                  placeholder="Kasallik yoki simptomlar tavsifi..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Og'irlik darajasi</label>
                <select 
                  className="form-select" 
                  value={form.severity} 
                  onChange={(e) => setForm({...form, severity: e.target.value})}
                >
                  <option value="mild">Yengil (Mild)</option>
                  <option value="moderate">O'rtacha (Moderate)</option>
                  <option value="severe">Og'ir (Severe)</option>
                  <option value="critical">Kritik (Critical)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Qo'shimcha Eslatmalar</label>
                <textarea 
                  className="form-textarea" 
                  value={form.notes} 
                  onChange={(e) => setForm({...form, notes: e.target.value})} 
                  rows={2} 
                />
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
