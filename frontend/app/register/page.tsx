'use client'

import { useActionState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { signUpAction, verifyEmailAction, resendVerificationAction } from './actions'
import { initiateOAuthAction } from '../login/actions'
import { Scissors, Mail } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

type SignUpState = {
  error?: string
  requireVerification?: boolean
  email?: string
} | null

type VerifyState = {
  error?: string
} | null

export default function RegisterPage() {
  // ─── Sign Up ────────────────────────────────────────────────────────────────
  const [signUpState, signUpFormAction, isSigningUp] = useActionState<SignUpState, FormData>(
    signUpAction,
    null
  )
  const [oauthPending, startOAuth] = useTransition()

  // ─── Verify Email ────────────────────────────────────────────────────────────
  const [verifyState, verifyFormAction, isVerifying] = useActionState<VerifyState, FormData>(
    verifyEmailAction,
    null
  )

  // ─── Resend ──────────────────────────────────────────────────────────────────
  const [resendState, resendFormAction, isResending] = useActionState(
    resendVerificationAction,
    null
  )

  // OTP inputs refs for auto-focus navigation
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const email = signUpState?.email ?? ''
  const showOTP = !!signUpState?.requireVerification

  // Auto-focus first OTP input when verification step appears
  useEffect(() => {
    if (showOTP) otpRefs.current[0]?.focus()
  }, [showOTP])

  const handleOtpKeyUp = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    if (e.key !== 'Backspace' && input.value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    e.target.value = val
    if (val && index < 5) otpRefs.current[index + 1]?.focus()
  }

  // Collect OTP from all inputs into hidden field when form submits
  const collectOtp = (form: HTMLFormElement) => {
    const digits = otpRefs.current.map((r) => r?.value ?? '').join('')
    const hidden = form.elements.namedItem('otp') as HTMLInputElement | null
    if (hidden) hidden.value = digits
  }

  return (
    <div className="auth-page">
      {/* ── Left: Branding ── */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <div className="auth-brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scissors size={28} />
          </div>
          <span className="auth-brand-name">Bookeiro</span>
        </div>
        <h2 className="auth-brand-tagline">
          Empieza gratis,<br />
          <span>escala sin límites</span>
        </h2>
        <p className="auth-brand-desc">
          Crea tu cuenta en segundos y comienza a gestionar tu barbería
          con la plataforma más potente del mercado. Sin tarjeta de crédito.
        </p>
        <ul className="auth-features">
          {[
            'Configuración en menos de 5 minutos',
            'Hasta 3 profesionales en el plan gratuito',
            'Soporte técnico incluido',
            'Migración de datos asistida',
            'Sin permanencia — cancela cuando quieras',
          ].map((f) => (
            <li key={f} className="auth-feature">
              <span className="auth-feature-dot" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right: Form ── */}
      <div className="auth-form-panel">
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
          <ThemeToggle />
        </div>
        <div className="auth-card">
          {!showOTP ? (
            /* ── Register Form ── */
            <>
              <div className="auth-card-header">
                <h1 className="auth-card-title">Crea tu cuenta</h1>
                <p className="auth-card-subtitle">Empieza gratis, sin tarjeta de crédito</p>
              </div>

              {signUpState?.error && (
                <div className="alert alert-error">⚠️ {signUpState.error}</div>
              )}

              {/* OAuth Buttons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-oauth"
                  style={{ width: '100%' }}
                  onClick={() => startOAuth(() => initiateOAuthAction('google'))}
                  disabled={oauthPending || isSigningUp}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar con Google
                </button>
              </div>

              <div className="auth-divider">o regístrate con email</div>

              <form action={signUpFormAction}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Nombre completo</label>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Juan Pérez"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Correo electrónico</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tu@correo.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">
                    Contraseña <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(mín. 6 caracteres)</span>
                  </label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={isSigningUp}>
                  {isSigningUp ? (
                    <><span className="spinner" /> Creando cuenta...</>
                  ) : (
                    'Crear cuenta gratis'
                  )}
                </button>
              </form>

              <div className="auth-footer">
                ¿Ya tienes cuenta?
                <Link href="/login">Inicia sesión</Link>
              </div>
            </>
          ) : (
            /* ── OTP Verification Step ── */
            <>
              <div className="auth-card-header">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                    <Mail size={32} />
                  </div>
                </div>
                <h1 className="auth-card-title">Verifica tu correo</h1>
                <p className="auth-card-subtitle">
                  Enviamos un código de 6 dígitos a<br />
                  <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>
                </p>
              </div>

              {verifyState?.error && (
                <div className="alert alert-error">⚠️ {verifyState.error}</div>
              )}
              {resendState?.success && (
                <div className="alert alert-success">✅ Código reenviado. Revisa tu correo.</div>
              )}
              {resendState?.error && (
                <div className="alert alert-error">⚠️ {resendState.error}</div>
              )}

              <form
                action={verifyFormAction}
                onSubmit={(e) => collectOtp(e.currentTarget)}
              >
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="otp" />

                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  Ingresa el código de verificación
                </p>

                {/* OTP Inputs */}
                <div className="otp-inputs">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-input"
                      onKeyUp={(e) => handleOtpKeyUp(i, e)}
                      onChange={(e) => handleOtpChange(i, e)}
                      aria-label={`Dígito ${i + 1} del código`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: '0.5rem' }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <><span className="spinner" /> Verificando...</>
                  ) : (
                    'Verificar y acceder'
                  )}
                </button>
              </form>

              {/* Resend form */}
              <form action={resendFormAction} style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <input type="hidden" name="email" value={email} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  ¿No recibiste el código?{' '}
                </span>
                <button
                  type="submit"
                  disabled={isResending}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-primary)', fontSize: '0.875rem',
                    fontWeight: 500, fontFamily: 'var(--font-sans)',
                    textDecoration: 'underline',
                  }}
                >
                  {isResending ? 'Reenviando...' : 'Reenviar código'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
