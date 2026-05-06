import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { prescriptionService, appointmentService, patientService } from '../services/clinicApi';
import { MdAdd, MdArrowBack, MdClose, MdDescription } from 'react-icons/md';
import toast from 'react-hot-toast';
import type { Appointment, Prescription, Patient } from '../types';

export default function PrescriptionsPage() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const [appointment, setAppt] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration_days: 7,
    notes: ''
  });

  const loadData = useCallback(async () => {
    if (!appointmentId) return;

    try {
      const [appt, press] = await Promise.all([
        appointmentService.getById(appointmentId),
        prescriptionService.getByAppointment(appointmentId) as Promise<{ data: Prescription[] }>
      ]);
      setAppt(appt);
      setPrescriptions(press.data || []);
      
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
      await prescriptionService.create({ ...form, appointment_id: appointmentId });
      toast.success('Resept saqlandi');
      setShowModal(false);
      setForm({ medication_name: '', dosage: '', frequency: '', duration_days: 7, notes: '' });
      loadData();
    } catch (e) {
      toast.error('Saqlashda xatolik');
    }
  };

  const handleFinish = async () => {
    if (!appointmentId) return;
    try {
      await appointmentService.updateStatus(appointmentId, { status: 'completed' });
      toast.success('Turni yakunlandi');
      navigate('/appointments');
    } catch (e) {
      toast.error('Holatni yangilashda xatolik');
    }
  };

  if (!appointmentId) {
    return (
      <div className="empty-state">
        <MdDescription size={64} color="var(--border)" />
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
            <h2>Dori Reseptlari</h2>
            <p>Bemor: {patient ? `${patient.first_name} ${patient.last_name}` : 'Yuklanmoqda...'}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Yangi Resept
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
            <label className="form-label" style={{ marginBottom: 4 }}>Holat</label>
            <span className={`badge badge-${appointment?.status}`}>{appointment?.status}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Reseptlar</h3>
        <div className="table-wrapper" style={{ border: 'none', marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Dori nomi</th>
                <th>Dozasi</th>
                <th>Chastota</th>
                <th>Muddati (kun)</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    Resept topilmadi
                  </td>
                </tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.medication_name}</td>
                    <td>{p.dosage}</td>
                    <td>{p.frequency}</td>
                    <td>{p.duration_days} kun</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button className="btn btn-success" onClick={handleFinish}>
          Turnini yakunlash (Completed)
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
          Turnilar ro'yxati
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Yangi Resept Yozish</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Dori nomi</label>
                <input 
                  type="text"
                  className="form-input" 
                  value={form.medication_name} 
                  onChange={(e) => setForm({...form, medication_name: e.target.value})} 
                  required 
                  placeholder="Masalan: Paratsetamol"
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Dozasi</label>
                  <input 
                    type="text"
                    className="form-input" 
                    value={form.dosage} 
                    onChange={(e) => setForm({...form, dosage: e.target.value})} 
                    required 
                    placeholder="500mg"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Muddati (kun)</label>
                  <input 
                    type="number"
                    className="form-input" 
                    value={form.duration_days} 
                    onChange={(e) => setForm({...form, duration_days: parseInt(e.target.value)})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Chastota (Qabul qilish tartibi)</label>
                <input 
                  type="text"
                  className="form-input" 
                  value={form.frequency} 
                  onChange={(e) => setForm({...form, frequency: e.target.value})} 
                  required 
                  placeholder="Kuniga 3 mahal ovqatdan keyin"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Eslatmalar</label>
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
