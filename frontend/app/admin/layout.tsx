'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard',  icon: '◈' },
  { href: '/admin/agenda',    label: 'Agenda',      icon: '📅' },
  { href: '/admin/pos',       label: 'POS · Caja',  icon: '💰' },
  { href: '/admin/barberos',  label: 'Barberos',    icon: '✂️' },
  { href: '/admin/reportes',  label: 'Reportes',    icon: '📊' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ nombre: string; rol: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('lacima_token');
    const u = localStorage.getItem('lacima_user');
    if (!token) { router.replace('/admin/login'); return; }
    if (u) setUser(JSON.parse(u));
  }, [router, pathname]);

  function logout() {
    localStorage.removeItem('lacima_token');
    localStorage.removeItem('lacima_user');
    router.replace('/admin/login');
  }

  if (pathname === '/admin/login') return children;

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99, display: 'none' }}
          className="mobile-overlay" />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="logo-text">LA CIMA</div>
          <div className="logo-sub">Sistema de Gestión</div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-card)', borderRadius: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.nombre}</div>
            <div style={{ fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{user.rol}</div>
          </div>
          <button className="btn btn-ghost btn-full btn-sm" onClick={logout} style={{ justifyContent: 'flex-start', color: 'var(--error)' }}>
            ⏻ Cerrar sesión
          </button>
          <Link href="/" className="btn btn-ghost btn-full btn-sm" style={{ justifyContent: 'flex-start', marginTop: '4px', fontSize: '12px' }}>
            ← Ver sitio web
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <button className="btn btn-ghost btn-icon" style={{ display: 'none' }} onClick={() => setMobileOpen(t => !t)}>
            ☰
          </button>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {NAV_ITEMS.find(n => n.href === pathname)?.label || 'Panel'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#0A0A0F', fontSize: '14px',
            }}>
              {user.nombre[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
