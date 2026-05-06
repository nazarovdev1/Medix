import { useEffect, useState } from 'react';
import { MdBusiness, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { departmentService } from '../services/clinicApi';
import toast from 'react-hot-toast';
import { useAppSelector } from '../app/hooks';

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const user = useAppSelector(s => s.auth.user);

  useEffect(() => {
    departmentService.getAll()
      .then((r: any) => setDepts(r.data || []))
      .catch(() => toast.error('Bo\'limlarni yuklashda xatolik'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Bo'limlar</h2>
          <p>Klinika bo'limlari boshqaruvi</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary"><MdAdd /> Yangi Bo'lim</button>
        )}
      </div>

      <div className="grid-3" style={{ marginTop: 24 }}>
        {isLoading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : depts.length === 0 ? (
          <p>Bo'limlar mavjud emas</p>
        ) : depts.map(d => (
          <div key={d.id} className="card department-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="dept-icon-box" style={{ background: 'var(--primary-light)', padding: 12, borderRadius: 12, color: 'white' }}>
                <MdBusiness size={24} />
              </div>
              {user?.role === 'admin' && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-icon btn-secondary btn-sm"><MdEdit /></button>
                  <button className="btn btn-icon btn-danger btn-sm"><MdDelete /></button>
                </div>
              )}
            </div>
            <h3 style={{ marginTop: 16 }}>{d.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>{d.description || 'Tavsif yo\'q'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
