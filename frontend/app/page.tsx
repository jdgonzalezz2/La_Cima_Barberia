import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import {
  CalendarCheck,
  Users,
  Wallet,
  Globe,
  ArrowUpRight,
} from 'lucide-react'
import './landing/landing.css'

export const metadata: Metadata = {
  title: 'Bookeiro — Software de reservas para barberías, salones y spas',
  description:
    'Gestiona reservas, profesionales, comisiones y contabilidad. Tus clientes reservan desde tu vitrina pública con tu propia marca.',
}

const MARQUEE_ITEMS = [
  'Barberías',
  <em key="s">Salones</em>,
  'Spas',
  <em key="p">Peluquerías</em>,
  'Estéticas',
  <em key="u">Uñas</em>,
  'Masajes',
  <em key="b">Cejas</em>,
]

export default async function LandingPage() {
  const user = await getCurrentUser()
  const primaryHref = user ? '/dashboard' : '/register'
  const primaryLabel = user ? 'Ir al dashboard' : 'Empezar gratis'

  return (
    <div className="landing-shell">
      <header className="ln-nav">
        <div className="ln-nav-inner">
          <Link href="/" className="ln-logo" aria-label="Bookeiro">
            <span className="ln-logo-mark" aria-hidden />
            Bookeiro
          </Link>
          <nav>
            <ul className="ln-nav-links">
              <li><a href="#features">Producto</a></li>
              <li><a href="#vitrina">Vitrina pública</a></li>
              <li><a href="#como">Cómo funciona</a></li>
              <li><a href="#faq">Preguntas</a></li>
            </ul>
          </nav>
          <div className="ln-nav-ctas">
            {!user && (
              <Link href="/login" className="ln-btn ln-btn-ghost">
                Entrar
              </Link>
            )}
            <Link href={primaryHref} className="ln-btn ln-btn-primary">
              {primaryLabel}
              <ArrowUpRight size={16} className="ln-btn-arrow" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="ln-hero">
        <div>
          <div className="ln-eyebrow">Software para profesionales de la belleza</div>
          <h1>
            Reservas <em>impecables</em> para tu barbería, salón o spa.
          </h1>
          <p className="ln-lede">
            Agenda, equipo, comisiones y contabilidad en un solo lugar. Tus clientes reservan
            desde una vitrina pública con tu marca — sin apps, sin fricción.
          </p>
          <div className="ln-hero-ctas">
            <Link href={primaryHref} className="ln-btn ln-btn-primary ln-btn-lg">
              {primaryLabel}
              <ArrowUpRight size={18} className="ln-btn-arrow" />
            </Link>
            <a href="#features" className="ln-btn ln-btn-ghost ln-btn-lg">
              Ver cómo funciona
            </a>
          </div>
          <div className="ln-hero-meta">
            <span><span className="ln-hero-meta-dot" />Sin tarjeta de crédito</span>
            <span><span className="ln-hero-meta-dot" />Configura en 5 minutos</span>
            <span><span className="ln-hero-meta-dot" />Soporte en español</span>
          </div>
        </div>

        <div className="ln-hero-visual" aria-hidden>
          <div className="ln-card-stack">
            <div className="ln-booking-card ln-card-1">
              <div className="ln-bc-head"><span>Hoy · 10:30</span><span>45 min</span></div>
              <div className="ln-bc-service">Corte clásico<br />+ barba</div>
              <div className="ln-bc-client">Andrés Charry</div>
              <div className="ln-bc-foot">
                <div className="ln-bc-barber"><span className="ln-bc-avatar" />Julián</div>
                <div className="ln-bc-price">$45.000</div>
              </div>
            </div>

            <div className="ln-booking-card ln-card-2">
              <div className="ln-bc-head"><span>Hoy · 11:15</span><span>30 min</span></div>
              <div className="ln-bc-service">Fade degradado</div>
              <div className="ln-bc-client">Camila Rojas</div>
              <div className="ln-bc-foot">
                <div className="ln-bc-barber"><span className="ln-bc-avatar" />Daniela</div>
                <div className="ln-bc-price">$35.000</div>
              </div>
            </div>

            <div className="ln-booking-card ln-card-3">
              <div className="ln-bc-head"><span>Hoy · 12:00</span><span>60 min</span></div>
              <div className="ln-bc-service">Color + hidratación</div>
              <div className="ln-bc-client">Laura Méndez</div>
              <div className="ln-bc-foot">
                <div className="ln-bc-barber"><span className="ln-bc-avatar" />Sofía</div>
                <div className="ln-bc-price">$120.000</div>
              </div>
            </div>

            <div className="ln-card-chip">Confirmada</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="ln-marquee" aria-hidden>
        <div className="ln-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="ln-marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="ln-section" id="features">
        <div className="ln-section-head">
          <div>
            <div className="ln-eyebrow">Tu negocio, en orden</div>
            <h2>
              Todo lo que gestionas en el día,<br />
              <em>sin planillas ni caos.</em>
            </h2>
          </div>
          <p>
            Bookeiro reúne la agenda, el equipo, la caja y la vitrina pública en una sola plataforma
            diseñada para profesionales de la belleza.
          </p>
        </div>

        <div className="ln-bento">
          {/* Reservas — large */}
          <article className="ln-feature ln-feature-large">
            <div className="ln-feature-tag">Agenda</div>
            <div className="ln-feature-icon">
              <CalendarCheck size={22} strokeWidth={1.7} />
            </div>
            <h3>Reservas que <em>nunca</em> chocan.</h3>
            <p className="ln-feature-body">
              Disponibilidad en tiempo real, detección de solapamientos y confirmaciones automáticas.
              Tu agenda se actualiza sola, en el local y desde la vitrina pública.
            </p>
          </article>

          {/* Equipo — small */}
          <article className="ln-feature ln-feature-small ln-feature-dark">
            <div className="ln-feature-tag">Equipo</div>
            <div className="ln-feature-icon">
              <Users size={22} strokeWidth={1.7} />
            </div>
            <h3>Horarios por <em>barbero</em>.</h3>
            <p className="ln-feature-body">
              Cada profesional con sus turnos, servicios y precios propios.
            </p>
          </article>

          {/* Finanzas — small */}
          <article className="ln-feature ln-feature-small">
            <div className="ln-feature-tag">Finanzas</div>
            <div className="ln-feature-icon">
              <Wallet size={22} strokeWidth={1.7} />
            </div>
            <h3>Comisiones claras.</h3>
            <p className="ln-feature-body">
              Ingresos, división 50/50 y retiros listos.
            </p>
            <div className="ln-mini-chart">
              <span style={{ height: '30%' }} />
              <span style={{ height: '55%' }} />
              <span style={{ height: '40%' }} />
              <span style={{ height: '75%' }} />
              <span style={{ height: '65%' }} />
              <span style={{ height: '90%' }} />
              <span style={{ height: '80%' }} />
            </div>
          </article>

          {/* Vitrina — large */}
          <article className="ln-feature ln-feature-large">
            <div className="ln-feature-tag">Vitrina pública</div>
            <div className="ln-feature-icon">
              <Globe size={22} strokeWidth={1.7} />
            </div>
            <h3>Tu marca, <em>tu link</em>, tus reservas.</h3>
            <p className="ln-feature-body">
              Cada barbería recibe su página pública: tipografía, colores, logo y servicios propios.
              Comparte un link y recibe reservas desde Instagram, Google o WhatsApp.
            </p>
            <div className="ln-link-preview">
              <Globe size={14} />
              bookeiro.co/<strong>tu-barberia</strong>
            </div>
          </article>
        </div>
      </section>

      {/* SHOWCASE — Vitrina */}
      <section className="ln-showcase" id="vitrina">
        <div className="ln-showcase-copy">
          <div className="ln-eyebrow">Vitrina pública</div>
          <h2>Un espacio digital que se <em>siente tuyo</em>.</h2>
          <p>
            Personaliza colores, tipografía y logo. Muestra tu equipo, servicios y reseñas.
            Tus clientes reservan en dos toques, sin crear cuenta.
          </p>
          <ul className="ln-showcase-list">
            <li>Diseño personalizable: claro, oscuro y colores de marca</li>
            <li>Precios por servicio y por profesional</li>
            <li>Reseñas con estrellas verificadas</li>
            <li>Compatible con cualquier dispositivo</li>
          </ul>
          <Link href={primaryHref} className="ln-btn ln-btn-link">
            Crea tu vitrina gratis
          </Link>
        </div>

        <div className="ln-phone" aria-hidden>
          <div className="ln-phone-screen">
            <div className="ln-phone-hero">
              <div className="ln-phone-hero-label">La Cima Barbería</div>
              <h4>
                Estilo que <em>habla</em><br />por ti.
              </h4>
            </div>
            <div className="ln-phone-body">
              <div className="ln-svc-row ln-svc-row-selected">
                <div>
                  <div className="ln-svc-name">Corte + barba</div>
                  <div className="ln-svc-meta">45 min · Julián</div>
                </div>
                <div className="ln-svc-price">$45.000</div>
              </div>
              <div className="ln-svc-row">
                <div>
                  <div className="ln-svc-name">Fade degradado</div>
                  <div className="ln-svc-meta">30 min</div>
                </div>
                <div className="ln-svc-price">$35.000</div>
              </div>
              <div className="ln-svc-row">
                <div>
                  <div className="ln-svc-name">Color + hidratación</div>
                  <div className="ln-svc-meta">60 min</div>
                </div>
                <div className="ln-svc-price">$120.000</div>
              </div>
              <div className="ln-svc-row">
                <div>
                  <div className="ln-svc-name">Diseño de cejas</div>
                  <div className="ln-svc-meta">20 min</div>
                </div>
                <div className="ln-svc-price">$18.000</div>
              </div>
              <div className="ln-phone-cta">Reservar ahora</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="ln-how" id="como">
        <div className="ln-how-inner">
          <div className="ln-how-head">
            <div className="ln-eyebrow">Empieza hoy</div>
            <h2>Del caos al control en <em>tres pasos</em>.</h2>
          </div>
          <div className="ln-steps">
            <div className="ln-step">
              <div className="ln-step-num">01</div>
              <h3>Crea tu cuenta</h3>
              <p>Sin tarjeta, sin instalación. Registra tu barbería en menos de dos minutos.</p>
            </div>
            <div className="ln-step">
              <div className="ln-step-num">02</div>
              <h3>Configura servicios y equipo</h3>
              <p>Agrega a tus profesionales, sus horarios y los servicios que ofrecen con sus precios.</p>
            </div>
            <div className="ln-step">
              <div className="ln-step-num">03</div>
              <h3>Comparte tu link</h3>
              <p>Recibe reservas desde tu vitrina pública mientras tu agenda se llena sola.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ln-faq" id="faq">
        <div className="ln-faq-head">
          <div className="ln-eyebrow ln-eyebrow-center">Preguntas frecuentes</div>
          <h2>Todo lo que te <em>preguntabas</em>.</h2>
          <p>Si necesitas más detalle, escríbenos y te respondemos el mismo día.</p>
        </div>

        <div className="ln-faq-list">
          <details className="ln-faq-item">
            <summary>¿Cuánto cuesta usar Bookeiro?<span className="ln-faq-icon" aria-hidden /></summary>
            <p>
              Puedes empezar gratis y configurar tu barbería completa sin tarjeta. Los planes pagos
              incluyen funciones avanzadas de contabilidad, múltiples sedes y soporte prioritario.
            </p>
          </details>
          <details className="ln-faq-item">
            <summary>¿Sirve para salones de belleza o spas, no solo barberías?<span className="ln-faq-icon" aria-hidden /></summary>
            <p>
              Sí. Aunque nacimos enfocados en barberías, Bookeiro funciona igual de bien para salones,
              spas, estéticas, uñas, cejas y cualquier negocio de servicios por cita.
            </p>
          </details>
          <details className="ln-faq-item">
            <summary>¿Cómo funcionan las comisiones del equipo?<span className="ln-faq-icon" aria-hidden /></summary>
            <p>
              Cada servicio puede tener un porcentaje por defecto (ej. 50/50) y reglas por profesional.
              Bookeiro calcula automáticamente lo que le corresponde a cada uno y registra los retiros.
            </p>
          </details>
          <details className="ln-faq-item">
            <summary>¿Mis clientes necesitan crear cuenta para reservar?<span className="ln-faq-icon" aria-hidden /></summary>
            <p>
              No. Desde tu vitrina pública reservan con nombre y teléfono. Tú mantienes el control de
              la agenda y el historial de cada cliente.
            </p>
          </details>
          <details className="ln-faq-item">
            <summary>¿Puedo personalizar la vitrina pública con mi marca?<span className="ln-faq-icon" aria-hidden /></summary>
            <p>
              Totalmente. Cambia colores, tipografía, logo y modo claro/oscuro. Tu vitrina se ve como
              tu negocio — no como una plantilla genérica.
            </p>
          </details>
          <details className="ln-faq-item">
            <summary>¿Qué pasa si tengo dos o más locales?<span className="ln-faq-icon" aria-hidden /></summary>
            <p>
              Bookeiro es multi-sede: cada local tiene su agenda, equipo y vitrina, y tú ves el
              consolidado desde un único dashboard.
            </p>
          </details>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ln-final">
        <div className="ln-final-inner">
          <h2>Listo para modernizar<br />tu <em>negocio</em>.</h2>
          <p>
            Únete a las barberías, salones y spas que ya están dejando atrás las planillas.
            Configura Bookeiro en 5 minutos.
          </p>
          <div className="ln-hero-ctas" style={{ justifyContent: 'center', marginBottom: 0 }}>
            <Link href={primaryHref} className="ln-btn ln-btn-gold ln-btn-lg">
              {primaryLabel}
              <ArrowUpRight size={18} className="ln-btn-arrow" />
            </Link>
            <Link href="/login" className="ln-btn ln-btn-ghost ln-btn-lg">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ln-footer">
        <div className="ln-footer-inner">
          <div className="ln-logo">
            <span className="ln-logo-mark" aria-hidden />
            Bookeiro
          </div>
          <ul className="ln-footer-links">
            <li><a href="#features">Producto</a></li>
            <li><a href="#como">Cómo funciona</a></li>
            <li><a href="#faq">Preguntas</a></li>
            <li><Link href="/login">Entrar</Link></li>
          </ul>
          <span>© {new Date().getFullYear()} Bookeiro · Hecho para el cuidado personal.</span>
        </div>
      </footer>
    </div>
  )
}
