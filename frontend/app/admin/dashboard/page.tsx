'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lacima_token') : '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const h = getAuthHeader();
    const fecha = hoy;
    Promise.all([
      fetch(`${API}/api/pos/resumen?fecha=${fecha}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/agenda?fecha=${fecha}&limit=10`, { headers: h }).then(r => r.json()),
    ]).then(([r, c]) => { setResumen(r); setCitas(Array.isArray(c) ? c : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hoy]);

  const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

  const estadoBadge: Record<string, string> = {
    confirmada: 'badge-gold', completada: 'badge-success',
    cancelada: 'badge-error', pendiente: 'badge-neutral', no_show: 'badge-warning',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p className="section-tag">Resumen del día</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 400 }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h1>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '18px' }} />
        )) : [
          { label: 'Ingresos del día', val: formatCOP(resumen?.ingresos_totales), sub: `${resumen?.total_transacciones || 0} ventas` },
          { label: 'Efectivo', val: formatCOP(resumen?.efectivo), sub: 'Cobro en caja' },
          { label: 'Tarjeta', val: formatCOP(resumen?.tarjeta), sub: 'Crédito / débito' },
          { label: 'Citas hoy', val: citas.length.toString(), sub: `${citas.filter(c => c.estado === 'completada').length} completadas` },
        ].map(s => (
          <div key={s.label} className="stat-card animate-fadeInUp">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.val}</div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {resumen?.top_barbero && (
        <div className="card" style={{ marginBottom: '32px', borderColor: 'var(--gold-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,var(--gold-dark),var(--gold))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⭐</div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Barbero destacado hoy</div>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 500, color: 'var(--gold)' }}>{resumen.top_barbero.barbero}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{formatCOP(resumen.top_barbero.total_ventas)} en ventas</div>
          </div>
        </div>
      )}

      {/* ── Citas del día ─────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px' }}>Citas de hoy</h3>
          <a href="/admin/agenda" style={{ fontSize: '13px', color: 'var(--gold)' }}>Ver agenda completa →</a>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />)}
          </div>
        ) : citas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
            Sin citas registradas para hoy
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Barbero</th><th>Estado</th><th>Valor</th></tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      {new Date(c.fecha_hora_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{c.cliente_nombre || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.servicio_nombre}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.barbero_nombre}</td>
                    <td><span className={`badge ${estadoBadge[c.estado] || 'badge-neutral'}`}>{c.estado}</span></td>
                    <td style={{ fontWeight: 600 }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
