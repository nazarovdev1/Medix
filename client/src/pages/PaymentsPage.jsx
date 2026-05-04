import React, { useEffect, useState, useCallback } from 'react';
import { paymentService, appointmentService } from '../services/clinicApi';
import { MdAdd, MdFilterList } from 'react-icons/md';
import toast from 'react-hot-toast';

const PAYMENT_STATUSES = ['pending','paid','partial','refunded','failed'];
const PAYMENT_METHODS  = ['cash','card','insurance','online','other'];

const defaultForm = { appointment_id: '', payment_method: 'card', notes: '' };

export default function PaymentsPage() {
  const [payments, setPayments]     = useState([]);
  const [meta, setMeta]             = useState({});
  const [isLoading, setLoading]     = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(defaultForm);
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);
  const [appointments, setAppts]    = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAll({ page, status: statusFilter || undefined, limit: 20 });
      setPayments(res.data || []);
      setMeta(res.meta || {});
    } catch (e) {
      toast.error(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    appointmentService.getAll({ limit: 100, status: 'completed' })
      .then((r) => setAppts(r.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.create(form);
      toast.success('Payment recorded!');
      setShowModal(false);
      setForm(defaultForm);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create payment');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await paymentService.updateStatus(id, { status });
      toast.success(`Payment marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const statusColor = (s) => ({
    paid: '#34d399', pending: '#f59e0b', refunded: '#93c5fd',
    failed: '#ef4444', partial: '#a78bfa',
  }[s] || '#9ca3af');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Payments</h2>
          <p>{meta?.total ?? 0} total payment records</p>
        </div>
        <button id="add-payment-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Record Payment
        </button>
      </div>

      {/* ─── Filter ─────────────────────────────────────── */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdFilterList style={{ color: 'var(--text-muted)' }} />
          <select
            id="payment-status-filter"
            className="form-select"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────── */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th><th>Appointment</th><th>Amount</th>
              <th>Method</th><th>Receipt</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No payments found</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.patient_name || '—'}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {p.appt_date?.slice(0,10)} {p.appt_time?.slice(0,5)}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                  ${parseFloat(p.amount).toFixed(2)}
                </td>
                <td><span className="badge badge-confirmed">{p.payment_method}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {p.receipt_number || '—'}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.payment_date?.slice(0,10)}</td>
                <td>
                  <span className={`badge badge-${p.status}`} style={{ color: statusColor(p.status) }}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.78rem', padding: '5px 8px', width: 130 }}
                    value={p.status}
                    onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                  >
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

      {/* ─── Record Payment Modal ────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Payment</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Amount is auto-calculated from appointment services.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Appointment *</label>
                <select id="pay-appointment" name="appointment_id" className="form-select" value={form.appointment_id} onChange={handleChange} required>
                  <option value="">Select appointment…</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patient_name} — {a.appt_date?.slice(0,10)} {a.appt_time?.slice(0,5)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select id="pay-method" name="payment_method" className="form-select" value={form.payment_method} onChange={handleChange}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea name="notes" className="form-textarea" rows={2} value={form.notes} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="pay-submit" type="submit" className="btn btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
