'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type CitaData = {
  servicio: string; barbero: string; fecha: string; hora: string;
  precio: number; clienteNombre: string; id: number;
};

export default function ConfirmacionPage() {
  const [cita, setCita] = useState<CitaData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('cita_confirmada');
    if (data) setCita(JSON.parse(data));
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

  if (!cita) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-secondary)' }}>Cargando confirmación...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '16px 32px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '3px' }}>
          LA CIMA
        </Link>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }} className="animate-fadeInUp">
          {/* Success icon */}
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '32px',
            boxShadow: '0 0 40px rgba(201,168,76,0.3)',
          }}>
            ✓
          </div>

          <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>
            ¡Cita Confirmada!
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '42px', fontWeight: 300, marginBottom: '8px' }}>
            Nos vemos pronto,
          </h1>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '42px', fontWeight: 600, color: 'var(--gold)', marginBottom: '32px' }}>
            {cita.clienteNombre.split(' ')[0]}
          </h2>

          {/* Card con detalles */}
          <div className="card card-glass" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px' }}>
              Detalles de tu cita · #{cita.id}
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { icon: '👤', label: 'Barbero', val: cita.barbero },
                { icon: '✂️', label: 'Servicio', val: cita.servicio },
                { icon: '📅', label: 'Fecha', val: cita.fecha },
                { icon: '🕐', label: 'Hora', val: cita.hora },
                { icon: '💰', label: 'Valor', val: formatPrice(cita.precio) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                    <div style={{ fontWeight: 500, color: r.label === 'Valor' ? 'var(--gold)' : 'var(--text-primary)', marginTop: '2px' }}>{r.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp reminder */}
          <div style={{
            padding: '16px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)',
            borderRadius: '12px', marginBottom: '32px',
            display: 'flex', alignItems: 'center', gap: '12px',
            textAlign: 'left',
          }}>
            <span style={{ fontSize: '24px' }}>📱</span>
            <div>
              <div style={{ fontWeight: 600, color: '#25D166', fontSize: '14px' }}>Confirmación por WhatsApp</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Recibirás un recordatorio 24 horas antes de tu cita.
              </div>
            </div>
          </div>

          {/* Políticas */}
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.7 }}>
            📌 Por favor llega 5 minutos antes de tu cita.<br />
            Para cancelaciones, contáctanos con al menos 2 horas de anticipación.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-outline">← Volver al inicio</Link>
            <Link href="/reservar" className="btn btn-gold">Nueva cita</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
