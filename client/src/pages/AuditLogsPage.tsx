import { useEffect, useState } from 'react';
import { api } from '../services/clinicApi';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then(r => setLogs(r.data.data || []))
      .catch(() => toast.error('Audit loglarni yuklashda xatolik'))
      .finally(() => setLoading(false));
  }, []);

  const actionColor = (a: string) => {
    if (a === 'INSERT') return '#10b981';
    if (a === 'UPDATE') return '#f59e0b';
    if (a === 'DELETE') return '#ef4444';
    return '#6b7280';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Audit Loglar</h2>
          <p>Tizimdagi barcha o'zgarishlar tarixi</p>
        </div>
      </div>

      <div className="table-wrapper" style={{ marginTop: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vaqt</th><th>Foydalanuvchi</th><th>Amal</th><th>Jadval</th><th>ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><div className="loading-center"><span className="spinner" /></div></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loglar topilmadi</td></tr>
            ) : logs.map((log: any) => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                <td style={{ fontWeight: 500 }}>{log.changed_by_email || 'Tizim'}</td>
                <td>
                  <span className="badge" style={{ background: actionColor(log.action) + '20', color: actionColor(log.action) }}>
                    {log.action}
                  </span>
                </td>
                <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{log.table_name}</code></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.record_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
