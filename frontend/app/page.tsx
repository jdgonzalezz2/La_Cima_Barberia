'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Barbero = { id: number; nombre: string; apellido: string; especialidad: string; };
type Servicio = { id: number; nombre: string; descripcion: string; precio: number; duracion_minutos: number; categoria: string; };

const SERVICES_ICON: Record<string, string> = {
  corte: '✂️', barba: '🪒', combo: '⭐', tratamiento: '🌿',
};

export default function LandingPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    fetch(`${API}/api/barberos`).then(r => r.json()).then(setBarberos).catch(() => {});
    fetch(`${API}/api/servicios`).then(r => r.json()).then(setServicios).catch(() => {});
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '3px' }}>LA CIMA</div>
          <div style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '-1px' }}>BARBERÍA PREMIUM</div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="#servicios" style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Servicios</a>
          <a href="#equipo" style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Equipo</a>
          <Link href="/reservar" className="btn btn-gold btn-sm">Reservar</Link>
          <Link href="/admin/login" className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>Admin</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hero" style={{ paddingTop: '120px' }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content animate-fadeInUp">
          <div className="hero-tag">
            <span>✦</span> Bogotá, Colombia <span>✦</span>
          </div>
          <h1 className="hero-title">
            <span style={{ fontWeight: 300, fontSize: '0.6em', letterSpacing: '8px', textTransform: 'uppercase', display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>La Experiencia</span>
            <span className="brand">LA CIMA</span>
          </h1>
          <p className="hero-subtitle">
            Donde el arte del barbero clásico se encuentra con la estética contemporánea.
            Una experiencia diseñada para quien exige lo mejor.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/reservar" className="btn btn-gold btn-lg">
              ✦ Reservar Mi Cita
            </Link>
            <a href="#servicios" className="btn btn-outline btn-lg">Ver Servicios</a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '64px',
            flexWrap: 'wrap',
          }}>
            {[
              { val: '8+', label: 'Años de experiencia' },
              { val: '2K+', label: 'Clientes VIP' },
              { val: '100%', label: 'Satisfacción garantizada' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '42px', fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px', marginTop: '4px', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', animation: 'float 2s ease-in-out infinite' }}>
          <div style={{ width: '24px', height: '36px', border: '1.5px solid var(--gold-border)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── GOLD DIVIDER ────────────────────────────────────── */}
      <hr className="gold-line" style={{ margin: '0 10%' }} />

      {/* ── SERVICIOS ────────────────────────────────────────── */}
      <section id="servicios" style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="section-tag">Nuestros servicios</p>
          <h2 className="section-title">Arte en <strong>Cada Detalle</strong></h2>
        </div>

        {servicios.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '140px' }} />)}
          </div>
        ) : (
          <div className="services-grid">
            {servicios.map((s, i) => (
              <Link href={`/reservar?servicio=${s.id}`} key={s.id}
                className={`service-card animate-fadeInUp stagger-${Math.min(i + 1, 5)}`}
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{SERVICES_ICON[s.categoria] || '✂️'}</div>
                  <div className="service-card-name">{s.nombre}</div>
                  <div className="service-card-desc">{s.descripcion}</div>
                  <div className="service-card-meta">
                    <span className="service-card-price">{formatPrice(s.precio)}</span>
                    <span className="service-card-duration">⏱ {s.duracion_minutos} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── EQUIPO ───────────────────────────────────────────── */}
      <section id="equipo" style={{ padding: '80px 32px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="section-tag">Nuestro equipo</p>
            <h2 className="section-title">Maestros <strong>Barberos</strong></h2>
          </div>

          {barberos.length === 0 ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ width: '240px', height: '200px', borderRadius: '18px' }} />)}
            </div>
          ) : (
            <div className="barberos-grid">
              {barberos.map((b, i) => (
                <Link href={`/reservar?barbero=${b.id}`} key={b.id}
                  className={`barbero-card animate-fadeInUp stagger-${i + 1}`}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div className="barbero-avatar">
                    {b.nombre[0]}{b.apellido[0]}
                  </div>
                  <div className="barbero-name">{b.nombre} {b.apellido}</div>
                  <div className="barbero-especialidad">{b.especialidad}</div>
                  <div style={{ marginTop: '12px' }}>
                    <span className="badge badge-gold">Reservar →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section style={{
        padding: '100px 32px', textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
      }}>
        <p className="section-tag">¿Listo para la experiencia?</p>
        <h2 className="section-title" style={{ marginBottom: '24px' }}>Agenda Tu <strong>Próxima Cita</strong></h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '16px' }}>
          Sin filas, sin esperas. Reserva en menos de 2 minutos.
        </p>
        <Link href="/reservar" className="btn btn-gold btn-lg">
          ✦ Reservar Ahora
        </Link>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2px' }}>LA CIMA</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Barbería Premium · Bogotá, Colombia</div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2025 La Cima Barbería. Todos los derechos reservados.</div>
      </footer>
    </main>
  );
}
