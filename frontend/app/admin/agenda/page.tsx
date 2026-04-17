'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('lacima_token')}`, 'Content-Type': 'application/json' });

const ESTADOS = ['confirmada', 'completada', 'cancelada', 'no_show'];
const ESTADO_BADGE: Record<string, string> = { confirmada: 'badge-gold', completada: 'badge-success', cancelada: 'badge-error', no_show: 'badge-warning', pendiente: 'badge-neutral' };

export default function AgendaPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [barberoFiltro, setBarberoFiltro] = useState('');
  const [barberos, setBarberos] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ fecha });
      if (barberoFiltro) params.append('barberoId', barberoFiltro);
      const r = await fetch(`${API}/api/agenda?${params}`, { headers: getH() });
      const data = await r.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`${API}/api/barberos`).then(r => r.json()).then(setBarberos).catch(() => {});
  }, []);

  useEffect(() => { fetchCitas(); }, [fecha, barberoFiltro]);

  const updateEstado = async (id: number, estado: string) => {
    setUpdatingId(id);
    try {
      await fetch(`${API}/api/agenda/${id}/estado`, {
        method: 'PATCH', headers: getH(), body: JSON.stringify({ estado }),
      });
      fetchCitas();
    } catch {} finally { setUpdatingId(null); }
  };

  const citasPorHora = citas.reduce((acc: any, c: any) => {
    const h = new Date(c.fecha_hora_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    if (!acc[h]) acc[h] = [];
    acc[h].push(c); return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="section-tag">Gestión de agenda</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 400 }}>Agenda</h1>
        </div>
        <a href="/reservar" target="_blank" className="btn btn-gold btn-sm">+ Nueva cita</a>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
          <label className="form-label">Fecha</label>
          <input type="date" className="form-input" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
          <label className="form-label">Barbero</label>
          <select className="form-select" value={barberoFiltro} onChange={e => setBarberoFiltro(e.target.value)}>
            <option value="">Todos</option>
            {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={fetchCitas}>↻ Actualizar</button>
        </div>
      </div>

      {/* Calendar view */}
      {loading ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
      ) : citas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>No hay citas para esta fecha</div>
          <div style={{ marginTop: '16px' }}>
            <a href="/reservar" target="_blank" className="btn btn-gold btn-sm">Crear primera cita</a>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(citasPorHora).map(([hora, cs]: [string, any]) => (
            <div key={hora}>
              <div style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
                {hora}
              </div>
              {(cs as any[]).map((c: any) => (
                <div key={c.id} className="card" style={{ borderLeft: '3px solid var(--gold)', borderRadius: '0 12px 12px 0', marginBottom: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{c.cliente_nombre || 'Sin nombre'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {c.servicio_nombre} · {c.barbero_nombre}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(c.fecha_hora_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} →
                      {new Date(c.fecha_hora_fin).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--gold)' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.monto)}
                    </span>
                    <span className={`badge ${ESTADO_BADGE[c.estado] || 'badge-neutral'}`}>{c.estado}</span>
                    {c.estado === 'confirmada' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-outline" style={{ fontSize: '12px', padding: '6px 10px', color: 'var(--success)', borderColor: 'rgba(76,175,80,0.3)' }}
                          disabled={updatingId === c.id} onClick={() => updateEstado(c.id, 'completada')}>
                          ✓ Completada
                        </button>
                        <button className="btn btn-sm btn-danger" style={{ fontSize: '12px', padding: '6px 10px' }}
                          disabled={updatingId === c.id} onClick={() => updateEstado(c.id, 'cancelada')}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
