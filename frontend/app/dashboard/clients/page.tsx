import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getAccessToken } from '@/lib/cookies'
import CustomersClient from './CustomersClient'

export const metadata = { title: 'Base de Clientes | Bookeiro' }

export default async function CustomersPage() {
  const profile = await getCurrentProfile()
  if (!profile || !profile.tenant_id) redirect('/login')

  const accessToken = await getAccessToken()
  const insforge = createInsForgeServerClient(accessToken)

  // Fetch all appointments to build the customer base
  // In a massive production app, you'd want a separate table or a very optimized RPC.
  // For now, this is the most reliable way to get retroactive data.
  const { data: appointments, error } = await insforge.database
    .from('appointments')
    .select('customer_name, customer_phone, total_price, start_time, status')
    .eq('tenant_id', profile.tenant_id)
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching customers data:', error)
  }

  return (
    <div className="dashboard-container">
      <CustomersClient appointments={appointments || []} />
    </div>
  )
}
