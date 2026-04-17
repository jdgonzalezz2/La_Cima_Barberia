import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getAccessToken } from '@/lib/cookies'
import ClientPage from './ClientPage'

export const metadata = {
  title: 'Configuración Web | Bookeiro'
}

export default async function SettingsServerWrapper() {
  const profile = await getCurrentProfile()
  if (!profile || !profile.tenant_id) {
    redirect('/onboarding')
  }

  const accessToken = await getAccessToken()
  const insforge = createInsForgeServerClient(accessToken)

  const { data: tenant } = await insforge.database
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .single()

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', marginBottom: '1.5rem', fontWeight: 700 }}>
        Personalizar Sitio
      </h1>
      <ClientPage tenant={tenant} />
    </div>
  )
}
