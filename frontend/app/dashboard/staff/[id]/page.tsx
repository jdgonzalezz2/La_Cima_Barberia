import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getAccessToken } from '@/lib/cookies'
import HorariosClient from './HorariosClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Configurar Barbero | Bookeiro` }
}

export default async function StaffDetailServer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const staffId = resolvedParams.id
  
  const profile = await getCurrentProfile()
  if (!profile || !profile.tenant_id) redirect('/onboarding')

  const accessToken = await getAccessToken()
  const insforge = createInsForgeServerClient(accessToken)

  // Get professional
  const { data: staff } = await insforge.database
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (!staff) notFound()

  // Get their working hours
  const { data: hours } = await insforge.database
    .from('working_hours')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week', { ascending: true })

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Nav */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard/staff" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver a Configuración de Personal
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginTop: '0.5rem' }}>
          Horarios de <span style={{ color: 'var(--color-primary)' }}>{staff.name}</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Configura los bloques de horas en los que este barbero atiende citas.</p>
      </div>

      <HorariosClient staffId={staffId} initialHours={hours || []} />
    </div>
  )
}
