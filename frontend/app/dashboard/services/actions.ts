'use server'

import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getAccessToken } from '@/lib/cookies'
import { getCurrentProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function getClientAndTenant() {
  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error('Not logged in')
  const insforge = createInsForgeServerClient(accessToken)
  
  const profile = await getCurrentProfile()
  if (!profile || !profile.tenant_id) throw new Error('No tenant context')
  
  return { insforge, tenantId: profile.tenant_id }
}

export async function createServiceAction(name: string, description: string, duration_mins: number, base_price: number) {
  try {
    const { insforge, tenantId } = await getClientAndTenant()
    
    const { error } = await insforge.database
      .from('services')
      .insert({ tenant_id: tenantId, name, description, duration_mins, base_price })
      
    if (error) return { error: error.message }
    
    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteServiceAction(serviceId: string) {
  try {
    const { insforge, tenantId } = await getClientAndTenant()
    
    const { error } = await insforge.database
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('tenant_id', tenantId)
      
    if (error) return { error: error.message }
    
    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
