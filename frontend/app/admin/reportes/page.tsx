'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('lacima_token')}`, 'Content-Type': 'application/json' });

export default function ReportesPage() {
  const [barberos, setBarberos] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [desde, setDesde] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);
  const [selBarbero, setSelBarbero] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = getH();
      const params = new URLSearchParams({ desde, hasta });
      if (selBarbero) params.append('barberoId', selBarbero);
      const [c, v] = await Promise.all([
        fetch(`${API}/api/comisiones?${params}`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/pos?${params}`, { headers: h }).then(r => r.json()),
      ]);
      setComisiones(Array.isArray(c) ? c : []);
      setVentas(Array.isArray(v) ? v : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`${API}/api/barberos`, { headers: getH() }).then(r => r.json()).then(setBarberos).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [desde, hasta, selBarbero]);

  const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

  // Resumen por barbero
  const porBarbero = comisiones.reduce((acc: any, c: any) => {
    const k = c.barbero_nombre;
    if (!acc[k]) acc[k] = { nombre: k, ventas: 0, comision: 0, pendiente: 0, transacciones: 0 };
    acc[k].ventas += Number(c.monto_venta);
    acc[k].comision += Number(c.monto_comision);
    if (c.estado === 'pendiente') acc[k].pendiente += Number(c.monto_comision);
    acc[k].transacciones++;
    return acc;
  }, {});

  const totalVentas = ventas.reduce((a, v) => a + Number(v.total || 0), 0);
  const totalComisiones = comisiones.reduce((a, c) => a + Number(c.monto_comision || 0), 0);
  const totalPendiente = comisiones.filter(c => c.estado === 'pendiente').reduce((a, c) => a + Number(c.monto_comision || 0), 0);

  const pagarComision = async (id: number) => {
    await fetch(`${API}/api/comisiones/${id}/pagar`, { method: 'PATCH', headers: getH() });
    fetchData();
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p className="section-tag">Análisis financiero</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 400 }}>Reportes</h1>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
          <label className="form-label">Desde</label>
          <input type="date" className="form-input" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
          <label className="form-label">Hasta</label>
          <input type="date" className="form-input" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
          <label className="form-label">Barbero</label>
          <select className="form-select" value={selBarbero} onChange={e => setSelBarbero(e.target.value)}>
            <option value="">Todos</option>
            {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
          </select>
        </div>
        <button className="btn btn-gold btn-sm" onClick={fetchData}>Aplicar filtros</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Ingresos totales', val: formatCOP(totalVentas), sub: `${ventas.length} transacciones` },
          { label: 'Comisiones totales', val: formatCOP(totalComisiones), sub: 'A todo el equipo' },
          { label: 'Comisiones pendientes', val: formatCOP(totalPendiente), sub: 'Por liquidar' },
          { label: 'Margen bruto', val: formatCOP(totalVentas - totalComisiones), sub: `${totalVentas > 0 ? Math.round(((totalVentas - totalComisiones) / totalVentas) * 100) : 0}% del ingreso` },
        ].map(s => (
          <div key={s.label} className="stat-card animate-fadeInUp">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ fontSize: '28px' }}>{s.val}</div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Por barbero */}
      {Object.keys(porBarbero).length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', marginBottom: '20px' }}>Resumen por barbero</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Barbero</th><th>Transacciones</th><th>Ventas</th><th>Comisión</th><th>Pendiente</th></tr>
              </thead>
              <tbody>
                {Object.values(porBarbero).map((b: any) => (
                  <tr key={b.nombre}>
                    <td style={{ fontWeight: 600 }}>{b.nombre}</td>
                    <td>{b.transacciones}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatCOP(b.ventas)}</td>
                    <td>{formatCOP(b.comision)}</td>
                    <td><span style={{ color: b.pendiente > 0 ? 'var(--warning)' : 'var(--success)' }}>{formatCOP(b.pendiente)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalle comisiones */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', marginBottom: '20px' }}>Detalle de comisiones</h3>
        {loading ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '48px', borderRadius: '8px' }} />)}
          </div>
        ) : comisiones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No hay comisiones en el período seleccionado</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Fecha</th><th>Barbero</th><th>Factura</th><th>Venta</th><th>%</th><th>Comisión</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {comisiones.slice(0, 50).map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(c.fecha_venta || c.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ fontWeight: 500 }}>{c.barbero_nombre}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.numero_factura}</td>
                    <td>{formatCOP(c.monto_venta)}</td>
                    <td style={{ color: 'var(--gold)' }}>{c.porcentaje}%</td>
                    <td style={{ fontWeight: 600 }}>{formatCOP(c.monto_comision)}</td>
                    <td>
                      <span className={`badge ${c.estado === 'pagada' ? 'badge-success' : 'badge-warning'}`}>{c.estado}</span>
                    </td>
                    <td>
                      {c.estado === 'pendiente' && (
                        <button className="btn btn-sm btn-outline" style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--success)', borderColor: 'rgba(76,175,80,0.3)' }}
                          onClick={() => pagarComision(c.id)}>
                          Pagar
                        </button>
                      )}
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
