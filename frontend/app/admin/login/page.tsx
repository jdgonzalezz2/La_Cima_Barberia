'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Credenciales inválidas'); return; }
      localStorage.setItem('lacima_token', data.token);
      localStorage.setItem('lacima_user', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fadeInUp">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '4px' }}>LA CIMA</div>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>Panel de Administración</div>
          <hr className="gold-line" style={{ margin: '16px auto', width: '60px' }} />
        </div>

        <div className="card" style={{ borderColor: 'var(--gold-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '26px', marginBottom: '8px' }}>Iniciar sesión</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>Accede al sistema de gestión</p>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="admin@lacima.co" autoComplete="email"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            {error && (
              <div style={{ padding: '12px 16px', background: 'var(--error-muted)', border: '1px solid rgba(239,83,80,0.2)', borderRadius: '10px', color: 'var(--error)', fontSize: '14px' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" /> Ingresando...</> : 'Ingresar al sistema'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(201,168,76,0.05)', borderRadius: '10px', border: '1px dashed var(--gold-border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Credenciales de desarrollo:</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>👤 admin@lacima.co</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>🔑 LaCima2024!</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>← Volver al sitio</a>
        </div>
      </div>
    </div>
  );
}
