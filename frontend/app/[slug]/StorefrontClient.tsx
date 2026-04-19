'use client'

import { useState } from 'react'
import BookingModal from './BookingModal'
import { Camera, Globe, Phone, MessageCircle, Video, MapPin, Clock, Share2 } from 'lucide-react'

export default function StorefrontClient({ tenant, primaryColor, fontVar, services, staffList, reviews }: {
  tenant: any, primaryColor: string, fontVar: string, services: any[], staffList: any[], reviews: any[]
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [initialServiceId, setInitialServiceId] = useState<string|undefined>()
  const [initialStaffId, setInitialStaffId] = useState<string|undefined>()
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState<any|null>(null)

  const isLight = tenant.theme === 'light' || !tenant.theme

  // Definición de Tema Local Dinámico para esta ruta
  const themeStyles = {
    '--color-bg-base': isLight ? '#f9fafb' : '#0a0a0a',
    '--color-text-primary': isLight ? '#111827' : '#ffffff',
    '--color-text-secondary': isLight ? '#4b5563' : '#a1a1aa',
    '--color-text-muted': isLight ? '#6b7280' : '#71717a',
    '--color-border': isLight ? '#e5e7eb' : '#27272a',
    '--color-glass': isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
    '--color-glass-border': isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)',
    '--color-primary': primaryColor,
    fontFamily: fontVar,
    backgroundColor: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    minHeight: '100vh',
    paddingBottom: '4rem'
  } as React.CSSProperties

  const openBooking = (serviceId?: string, staffId?: string) => {
    setInitialServiceId(serviceId)
    setInitialStaffId(staffId)
    setModalOpen(true)
    setSelectedStaffForProfile(null) // Close profile if open
  }

  const openProfile = (staff: any) => {
    setSelectedStaffForProfile(staff)
  }

  // Helper Card Style Booksy-like
  const cardStyle = {
    background: 'var(--color-glass)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: isLight ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
  }

  // Reviews Math
  const totalReviews = reviews?.length || 0;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const ratingBars = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { s: stars, p: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0 };
  });

  const layoutStyle = tenant.layout_style || 'classic';
  const coverBg = tenant.cover_image_url ? `url(${tenant.cover_image_url}) center/cover no-repeat` : `var(--color-primary)`;

  // ─── SHARED COMPONENTS ───

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ''
    const cleaned = ('' + phone).replace(/\D/g, '')
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    }
    return phone
  }

  const BrandIcon = ({ name, size = 20 }: { name: string, size?: number }) => {
    const icons: Record<string, any> = {
      instagram: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      facebook: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      tiktok: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
        </svg>
      ),
      whatsapp: (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
          <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path>
        </svg>
      )
    }
    return icons[name] || null
  }

  const LogoElement = ({ small = false }: { small?: boolean }) => {
    const size = small ? 60 : 120;
    return tenant.logo_url ? (
      <img src={tenant.logo_url} alt="Logo" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `3px solid var(--color-bg-base)`, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: small ? 0 : '1.5rem' }} />
    ) : (
      <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: 'var(--color-glass)', border: `3px solid var(--color-border)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: small ? '1.5rem' : '3rem', marginBottom: small ? 0 : '1.5rem' }}>💈</div>
    )
  }

  const MainInfo = () => (
    <div>
      {layoutStyle !== 'minimal' && <LogoElement />}
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{tenant.name}</h1>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(tenant.tags || []).map((tag: string) => (
          <span key={tag} style={{ border: '1px solid var(--color-border)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>{tag}</span>
        ))}
        {(!tenant.tags || tenant.tags.length === 0) && (
          <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Servicios premium.</span>
        )}
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.8rem' }}>Sobre nosotros</h2>
      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        {tenant.description || `Bienvenido a ${tenant.name}. Atrévete a lucir diferente, contamos con servicios especializados de la mejor calidad.`}
      </p>
    </div>
  )

  const QuickInfo = () => (
    <div style={{ ...cardStyle, alignSelf: 'start', marginTop: layoutStyle === 'minimal' ? 0 : '20px' }}>
      {tenant.address && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}><MapPin size={20} /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dirección</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>{tenant.address}</div>
            {tenant.map_url && <a href={tenant.map_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>Ver dirección</a>}
          </div>
        </div>
      )}
      
      {(tenant.whatsapp || tenant.phone) && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>
            <Phone size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Contacto</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {formatPhoneNumber(tenant.whatsapp || tenant.phone)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {tenant.whatsapp && (
                  <a href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', width: '42px', height: '30px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)', transition: 'transform 0.2s' }}>
                    <BrandIcon name="whatsapp" size={16} />
                  </a>
                )}
                {tenant.phone && (
                  <a href={`tel:${tenant.phone}`} style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Llamar</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(tenant.instagram || tenant.facebook || tenant.tiktok) && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}><Share2 size={20} /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Redes Sociales</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {tenant.instagram && (
                <a href={`https://instagram.com/${tenant.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }} title="Instagram">
                  <BrandIcon name="instagram" />
                </a>
              )}
              {tenant.facebook && (
                <a href={tenant.facebook.startsWith('http') ? tenant.facebook : `https://facebook.com/${tenant.facebook}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }} title="Facebook">
                  <BrandIcon name="facebook" />
                </a>
              )}
              {tenant.tiktok && (
                <a href={tenant.tiktok.startsWith('http') ? tenant.tiktok : `https://tiktok.com/@${tenant.tiktok.replace('@','')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }} title="TikTok">
                  <BrandIcon name="tiktok" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}><Clock size={20} /></div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Horario hoy</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>09:00 - 20:00 (Varía por profesional)</div>
        </div>
      </div>
    </div>
  )

  const ServicesList = () => (
    <div style={{ marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem' }}>Servicios</h2>
      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {services.map(s => (
          <div key={s.id} style={{ ...cardStyle, minWidth: '280px', flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 50, height: 50, borderRadius: '8px', background: 'var(--color-glass)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                <span style={{ background: 'var(--color-glass)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid var(--color-primary)' }}>🔥 Popular</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{s.name}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.8rem', minHeight: '35px' }}>{s.description?.substring(0,60) || '(precio varía según barbero)'}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.duration_mins} min</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>${s.base_price}</div>
              </div>
              <button onClick={() => openBooking(s.id)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const StaffListGroup = () => (
    <div style={{ marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Nuestros Profesionales</h2>
      <div style={{ 
        display: 'flex', 
        gap: '1.75rem', 
        overflowX: 'auto', 
        paddingBottom: '2rem', 
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {staffList.map(st => {
          const initials = st.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          
          return (
            <div 
              key={st.id} 
              onClick={() => openProfile(st)} 
              style={{ 
                ...cardStyle, 
                minWidth: '260px', 
                flex: '0 0 auto', 
                textAlign: 'center', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }} 
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }} 
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = isLight ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              {/* Avatar Container */}
              <div style={{ 
                width: 110, 
                height: 110, 
                borderRadius: '50%', 
                background: 'var(--color-bg-base)', 
                marginBottom: '1.5rem', 
                overflow: 'hidden', 
                padding: '4px', 
                border: `2px solid var(--color-primary-muted)`,
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {st.avatar_url ? (
                  <img src={st.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt={st.name} />
                ) : (
                  <div style={{
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--color-bg-muted) 0%, var(--color-border) 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '0.05em'
                  }}>
                    {initials}
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{st.name}</h3>
              
              {/* Specialty Badge */}
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--color-primary)', 
                fontWeight: 700, 
                letterSpacing: '0.08em',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                background: 'rgba(201,168,76,0.1)',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid rgba(201,168,76,0.15)'
              }}>
                {st.specialty || 'Profesional'}
              </div>

              {st.bio && (
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--color-text-secondary)', 
                  lineHeight: 1.5, 
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '3em',
                  padding: '0 0.5rem'
                }}>
                  {st.bio}
                </p>
              )}

              {/* Bottom Row: Rating & Social */}
              <div style={{ 
                marginTop: 'auto', 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-glass-border)'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>★</span> 5.0
                </div>
                
                {st.instagram && (
                  <>
                    <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }} />
                    <a 
                      href={`https://instagram.com/${st.instagram.replace('@','')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        color: 'var(--color-text-secondary)', 
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                    >
                      <BrandIcon name="instagram" size={20} />
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )

  const ReviewsList = () => (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem' }}>Reseñas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b' }}>{avgRating}</div>
          <div style={{ color: '#f59e0b', fontSize: '1.5rem', margin: '0.5rem 0' }}>{'⭐'.repeat(Math.round(parseFloat(avgRating)) || 0)}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{totalReviews} reseñas</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {ratingBars.map(bar => (
            <div key={bar.s} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ width: 15 }}>{bar.s}★</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${bar.p}%`, height: '100%', background: '#f59e0b', transition: 'width 0.5s' }}></div>
              </div>
              <span style={{ width: 30, textAlign: 'right', color: 'var(--color-text-muted)' }}>{bar.p}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {totalReviews === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>Esta barbería aún no cuenta con reseñas.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} style={{ ...cardStyle, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, background: '#e0e7ff', color: '#3730a3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {r.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.customer_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.8rem' }}>{'⭐'.repeat(r.rating)}</div>
              {r.comment && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  "{r.comment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

  const ContentBelowInfo = () => (
    <>
      <ServicesList />
      <StaffListGroup />
      <ReviewsList />
      <BookingModal 
        isOpen={modalOpen} onClose={() => setModalOpen(false)} 
        tenant={tenant} primaryColor={primaryColor}
        initialServiceId={initialServiceId} initialStaffId={initialStaffId}
        services={services} staffList={staffList}
      />

      {/* Staff Profile Modal */}
      {selectedStaffForProfile && (
        <div 
          onClick={() => setSelectedStaffForProfile(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '1rem',
            animation: 'fadeIn 0.3s ease-out',
            cursor: 'zoom-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', maxWidth: 500, background: 'var(--color-bg-base)', 
              border: '1px solid var(--color-border)', borderRadius: '24px', 
              overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
              position: 'relative', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default'
            }}
          >
            <button 
              onClick={() => setSelectedStaffForProfile(null)} 
              style={{ 
                position: 'absolute', top: '1.25rem', right: '1.25rem', 
                background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', 
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#fff',
                fontSize: '1rem', fontWeight: 'bold', backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
            >
              ✕
            </button>

            {/* Profile Header Background */}
            <div style={{ height: '140px', background: `linear-gradient(135deg, ${primaryColor}22 0%, rgba(0,0,0,0) 100%)`, position: 'absolute', top: 0, left: 0, right: 0 }} />

            <div style={{ padding: '3rem 2rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'var(--color-bg-base)', margin: '0 auto 1.5rem', padding: '6px', border: `3px solid ${primaryColor}`, boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}>
                {selectedStaffForProfile.avatar_url ? (
                  <img src={selectedStaffForProfile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="Profile" />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
                    {selectedStaffForProfile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedStaffForProfile.name}</h2>
              <div style={{ color: primaryColor, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                {selectedStaffForProfile.specialty || 'Profesional'}
              </div>

              {selectedStaffForProfile.bio ? (
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '2rem' }}>
                  {selectedStaffForProfile.bio}
                </p>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '2rem' }}>
                  Este profesional aún no ha añadido una biografía.
                </p>
              )}

              {selectedStaffForProfile.instagram && (
                <a 
                  href={`https://instagram.com/${selectedStaffForProfile.instagram.replace('@','')}`} 
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', textDecoration: 'none', marginBottom: '2.5rem', opacity: 0.8, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                >
                  <BrandIcon name="instagram" size={24} />
                  <span style={{ fontWeight: 600 }}>@{selectedStaffForProfile.instagram.replace('@','')}</span>
                </a>
              )}

              <button 
                onClick={() => openBooking(undefined, selectedStaffForProfile.id)}
                style={{ 
                  width: '100%', padding: '1.25rem', borderRadius: '16px', 
                  background: primaryColor, color: '#fff', border: 'none', 
                  fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                  boxShadow: `0 10px 30px ${primaryColor}44`,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Reservar Cita con {selectedStaffForProfile.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // ─── RENDERING LAYOUTS ───

  if (layoutStyle === 'minimal') {
    return (
      <div style={themeStyles}>
        <div style={{ padding: '1rem 2rem', borderBottom: `1px solid var(--color-border)`, display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--color-glass)' }}>
          <LogoElement small />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{tenant.name}</h1>
        </div>
        <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <MainInfo />
            <QuickInfo />
          </div>
          <ContentBelowInfo />
        </div>
      </div>
    )
  }

  if (layoutStyle === 'split') {
    return (
      <div style={{ ...themeStyles, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 0 }}>
        {/* Left Side (Cover) */}
        <div style={{ flex: '1 1 40%', minWidth: '300px', minHeight: '350px', background: coverBg, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, var(--color-bg-base))', opacity: 0.6 }} />
        </div>
        {/* Right Side (Content) */}
        <div style={{ flex: '1 1 60%', padding: '3rem 2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <MainInfo />
              <QuickInfo />
            </div>
            <ContentBelowInfo />
          </div>
        </div>
      </div>
    )
  }

  // Classic Layout (Default)
  return (
    <div style={themeStyles}>
      <div style={{ 
        height: '280px', 
        background: coverBg,
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--color-bg-base))', opacity: 0.9 }} />
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem', marginTop: '-140px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <MainInfo />
          <QuickInfo />
        </div>
        <ContentBelowInfo />
      </div>
    </div>
  )
}
