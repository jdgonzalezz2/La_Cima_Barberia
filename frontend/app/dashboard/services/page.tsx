import { getCurrentProfile } from '@/lib/auth'
import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getAccessToken } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import ServiceDialog from './ServiceDialog'
import ServicesGridClient from './ServicesGridClient'
import { Scissors, Sparkles } from 'lucide-react'

export const metadata = { title: 'Catálogo de Servicios | Bookeiro' }

export default async function ServicesPage() {
  const profile = await getCurrentProfile()
  if (!profile || !profile.tenant_id) redirect('/onboarding')

  const accessToken = await getAccessToken()
  const insforge = createInsForgeServerClient(accessToken)

  const { data: services } = await insforge.database
    .from('services')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header className="dashboard-page-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 className="dashboard-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>
            <Scissors size={40} className="text-gold" /> Servicios y Precios
          </h1>
          <p className="dashboard-page-desc" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
            Administra el alma de tu negocio. Define tiempos, costos y experiencias para tus clientes.
          </p>
        </div>
        
        <ServiceDialog />
      </header>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>Catálogo Activo</h2>
        </div>
        
        {services?.length === 0 ? (
          <div className="alert border" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '32px', background: 'var(--color-bg-surface)' }}>
             <Scissors size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
             <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>No tienes servicios aún. Crea el primero para abrir tu agenda.</p>
          </div>
        ) : (
          <ServicesGridClient services={services || []} />
        )}
      </div>
    </div>
  )
}
