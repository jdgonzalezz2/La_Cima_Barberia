'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('lacima_token')}`, 'Content-Type': 'application/json' });

const METODOS_PAGO = ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'nequi', 'daviplata'];
const METODO_LABEL: Record<string, string> = { efectivo: '💵 Efectivo', tarjeta_credito: '💳 Crédito', tarjeta_debito: '💳 Débito', transferencia: '🏦 Transferencia', nequi: '📱 Nequi', daviplata: '📱 Daviplata' };

export default function POSPage() {
  const [barberos, setBarberos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [citasPendientes, setCitasPendientes] = useState<any[]>([]);
  const [selBarbero, setSelBarbero] = useState('');
  const [selCita, setSelCita] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => {
    const h = getH();
    fetch(`${API}/api/barberos`, { headers: h }).then(r => r.json()).then(setBarberos).catch(() => {});
    fetch(`${API}/api/servicios`, { headers: h }).then(r => r.json()).then(setServicios).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selBarbero) return;
    const hoy = new Date().toISOString().split('T')[0];
    fetch(`${API}/api/agenda?fecha=${hoy}&barberoId=${selBarbero}&estado=confirmada`, { headers: getH() })
      .then(r => r.json()).then(d => setCitasPendientes(Array.isArray(d) ? d : [])).catch(() => {});
  }, [selBarbero]);

  // Auto-cargar servicio de la cita seleccionada
  useEffect(() => {
    if (!selCita) return;
    const cita = citasPendientes.find(c => c.id === Number(selCita));
    if (cita) {
      const s = servicios.find(srv => srv.id === cita.servicio_id);
      if (s) addItem(s);
    }
  }, [selCita, citasPendientes, servicios]);

  const addItem = (s: any) => {
    setItems(prev => {
      const ex = prev.find(i => i.servicioId === s.id);
      if (ex) return prev.map(i => i.servicioId === s.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario } : i);
      return [...prev, { servicioId: s.id, descripcion: s.nombre, cantidad: 1, precioUnitario: s.precio, subtotal: s.precio }];
    });
  };
  const removeItem = (sid: number) => setItems(i => i.filter(x => x.servicioId !== sid));

  const subtotal = items.reduce((a, i) => a + i.subtotal, 0);
  const total = Math.max(0, subtotal - descuento);

  const formatCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  async function procesarVenta() {
    if (!selBarbero || items.length === 0) { showToast('Selecciona un barbero y al menos un servicio', 'error'); return; }
    setLoading(true);
    try {
      const citaSelObj = citasPendientes.find(c => c.id === Number(selCita));
      const res = await fetch(`${API}/api/pos`, {
        method: 'POST', headers: getH(),
        body: JSON.stringify({
          citaId: selCita ? Number(selCita) : null,
          barberoId: Number(selBarbero),
          clienteId: citaSelObj?.cliente_id || null,
          items, descuento, metodoPago,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Error al procesar', 'error'); return; }
      showToast(`✓ Venta registrada · ${data.numero_factura}`, 'success');
      setItems([]); setSelCita(''); setDescuento(0);
    } catch { showToast('Error de conexión', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p className="section-tag">Terminal de cobro</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 400 }}>Punto de Venta</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Izquierda */}
        <div>
          {/* Barbero y cita */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Barbero</label>
                <select className="form-select" value={selBarbero} onChange={e => { setSelBarbero(e.target.value); setSelCita(''); }}>
                  <option value="">Seleccionar...</option>
                  {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cita asociada (opcional)</label>
                <select className="form-select" value={selCita} onChange={e => setSelCita(e.target.value)} disabled={!selBarbero}>
                  <option value="">Sin cita</option>
                  {citasPendientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {new Date(c.fecha_hora_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} — {c.cliente_nombre || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Catálogo de servicios */}
          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Agregar servicios
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
              {servicios.map(s => (
                <button key={s.id} onClick={() => addItem(s)}
                  style={{
                    background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px', padding: '12px 16px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s ease', color: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold-border)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                  <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>{s.nombre}</div>
                  <div style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatCOP(s.precio)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>+ Agregar</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket */}
        <div>
          <div className="card" style={{ borderColor: 'var(--gold-border)', position: 'sticky', top: '80px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2px' }}>LA CIMA</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>TICKET DE VENTA</div>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                Selecciona servicios para agregar al ticket
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                {items.map(i => (
                  <div key={i.servicioId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{i.descripcion}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>x{i.cantidad} · {formatCOP(i.precioUnitario)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{formatCOP(i.subtotal)}</span>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(i.servicioId)} style={{ padding: '4px 8px', fontSize: '12px' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Descuento */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Descuento (COP)</label>
              <input className="form-input" type="number" min={0} max={subtotal}
                value={descuento} onChange={e => setDescuento(Number(e.target.value))} style={{ fontSize: '14px' }} />
            </div>

            {/* Totales */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'grid', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Subtotal', val: formatCOP(subtotal) },
                { label: 'Descuento', val: `- ${formatCOP(descuento)}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>{r.label}</span><span>{r.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '4px' }}>
                <span>TOTAL</span>
                <span style={{ color: 'var(--gold)' }}>{formatCOP(total)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Método de pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {METODOS_PAGO.map(m => (
                  <button key={m} onClick={() => setMetodoPago(m)}
                    style={{
                      padding: '8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                      border: `1px solid ${metodoPago === m ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                      background: metodoPago === m ? 'var(--gold-muted)' : 'var(--bg-input)',
                      color: metodoPago === m ? 'var(--gold)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}>
                    {METODO_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-gold btn-full btn-lg" onClick={procesarVenta}
              disabled={loading || items.length === 0 || !selBarbero}>
              {loading ? <><div className="spinner" /> Procesando...</> : `Cobrar ${formatCOP(total)}`}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
