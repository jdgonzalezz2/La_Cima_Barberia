'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('lacima_token')}`, 'Content-Type': 'application/json' });

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', bio: '', especialidad: '', porcentaje_comision: 40 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchBarberos = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/barberos`, { headers: getH() });
      setBarberos(await r.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchBarberos(); }, []);

  const openNew = () => { setEditando(null); setForm({ nombre: '', apellido: '', bio: '', especialidad: '', porcentaje_comision: 40 }); setModal(true); };
  const openEdit = (b: any) => { setEditando(b); setForm({ nombre: b.nombre, apellido: b.apellido, bio: b.bio || '', especialidad: b.especialidad || '', porcentaje_comision: b.porcentaje_comision }); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      const url = editando ? `${API}/api/barberos/${editando.id}` : `${API}/api/barberos`;
      const method = editando ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: getH(), body: JSON.stringify(form) });
      if (r.ok) { setModal(false); fetchBarberos(); setToast('✓ Barbero guardado'); setTimeout(() => setToast(''), 3000); }
    } catch {} finally { setSaving(false); }
  };

  const toggle = async (id: number) => {
    await fetch(`${API}/api/barberos/${id}/toggle`, { method: 'PATCH', headers: getH() });
    fetchBarberos();
  };

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="section-tag">Gestión del equipo</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 400 }}>Barberos</h1>
        </div>
        <button className="btn btn-gold" onClick={openNew}>+ Nuevo barbero</button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '18px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {barberos.map(b => (
            <div key={b.id} className="card" style={{ borderColor: b.activo ? 'rgba(255,255,255,0.06)' : 'rgba(239,83,80,0.2)', opacity: b.activo ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,var(--gold-dark),var(--gold))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '20px', color: '#0A0A0F',
                  flexShrink: 0,
                }}>
                  {b.nombre[0]}{b.apellido[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--font-cormorant)', fontSize: '18px' }}>{b.nombre} {b.apellido}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.especialidad}</div>
                </div>
              </div>
              {b.bio && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>{b.bio}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-gold">Comisión: {b.porcentaje_comision}%</span>
                <span className={`badge ${b.activo ? 'badge-success' : 'badge-error'}`}>{b.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(b)}>✎ Editar</button>
                <button className={`btn btn-sm ${b.activo ? 'btn-danger' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => toggle(b.id)}>
                  {b.activo ? '✕ Desactivar' : '✓ Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '26px', marginBottom: '24px' }}>
              {editando ? 'Editar barbero' : 'Nuevo barbero'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input className="form-input" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Especialidad</label>
              <input className="form-input" value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Porcentaje de comisión (%)</label>
              <input className="form-input" type="number" min={0} max={100} step={0.5}
                value={form.porcentaje_comision} onChange={e => setForm(f => ({ ...f, porcentaje_comision: Number(e.target.value) }))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={save} disabled={saving || !form.nombre || !form.apellido}>
                {saving ? <><div className="spinner" /> Guardando...</> : 'Guardar barbero'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
