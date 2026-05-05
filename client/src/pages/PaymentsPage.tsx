import { useEffect, useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { paymentService, appointmentService } from '../services/clinicApi';
import { MdAdd, MdFilterList, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { PAYMENT_STATUSES, PAYMENT_METHODS, defaultPaymentForm } from '../types';
import type { Payment, Appointment, PaymentFormData, PaymentStatus, PaginationMeta } from '../types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0, hasPrev: false, hasNext: false });
  const [isLoading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PaymentFormData>(defaultPaymentForm);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [appointments, setAppts] = useState<Appointment[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAll({ page, status: statusFilter || undefined, limit: 20 });
      setPayments(res.data || []);
      setMeta(res.meta || {});
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'To\'lovlarni yuklashda xatolik';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    appointmentService.getAll({ limit: 100, status: 'completed' })
      .then((r) => setAppts(r.data || [])).catch(() => {});
  }, []);

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.create(form);
      toast.success('To\'lov qayd qilindi!');
      setShowModal(false);
      setForm(defaultPaymentForm);
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'To\'lov yaratishda xatolik';
      toast.error(message);
    }
  };

  const handleStatusUpdate = async (id: string, status: PaymentStatus) => {
    try {
      await paymentService.updateStatus(id, { status });
      toast.success(`To'lov ${status} deb belgilandi`);
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Yangilashda xatolik';
      toast.error(message);
    }
  };

  const statusColor = (s: PaymentStatus): string => ({
    paid: '#34d399', pending: '#f59e0b', refunded: '#93c5fd',
    failed: '#ef4444', partial: '#a78bfa',
  }[s] || '#9ca3af');

  const paginationMeta = meta;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>To'lovlar</h2>
          <p>{paginationMeta?.total ?? 0} ta to'lov qaydi</p>
        </div>
        <button id="add-payment-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> To'lovni Qayd Qilish
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdFilterList style={{ color: 'var(--text-muted)' }} />
          <select
            id="payment-status-filter"
            className="form-select"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Barcha Holatlar</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Bemor</th><th>Turni</th><th>Miqdor</th><th>Usul</th><th>Holat</th><th>Sana</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>To'lov topilmadi</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id}>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id}</td>
                <td style={{ fontWeight: 500 }}>{p.patient_name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.appointment_id ? `#${p.appointment_id}` : '—'}</td>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.amount.toLocaleString()} so'm</td>
                <td>{p.payment_method}</td>
                <td>
                  <span className="badge" style={{ background: statusColor(p.status) + '20', color: statusColor(p.status) }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('uz-UZ') : '—'}</td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusUpdate(p.id, e.target.value as PaymentStatus)}
                    className="form-select"
                    style={{ width: 120 }}
                  >
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginationMeta.totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={!paginationMeta.hasPrev}>‹</button>
          {Array.from({ length: paginationMeta.totalPages }, (_, i) => (
            <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
          ))}
          <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!paginationMeta.hasNext}>›</button>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">To'lovni Qayd Qilish</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Turni (Appointment)</label>
                <select name="appointment_id" className="form-select" value={form.appointment_id} onChange={handleChange} required>
                  <option value="">— Turni tanlang —</option>
                  {appointments.map((a) => <option key={a.id} value={a.id}>
                    #{a.id} - {a.patient_name} / {a.doctor_name} ({a.appt_date})
                  </option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Usul</label>
                <select name="payment_method" className="form-select" value={form.payment_method} onChange={handleChange} required>
                  <option value="">— Usul tanlang —</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tavsif</label>
                <textarea name="notes" className="form-textarea" value={form.notes} onChange={handleChange} rows={2} />
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
