'use server'

import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getCurrentUser } from '@/lib/auth'
import { getAccessToken } from '@/lib/cookies'

export async function createTenantAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser()
    const accessToken = await getAccessToken()

    if (!user || !accessToken) {
      return { error: 'No autorizado' }
    }

    const name = String(formData.get('name') ?? '').trim()
    const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    const phone = String(formData.get('phone') ?? '').trim()

    if (!name || !slug) {
      return { error: 'El nombre de la barbería y la URL son obligatorios.' }
    }

    if (slug.length < 3) {
      return { error: 'La URL (slug) debe tener al menos 3 caracteres.' }
    }

    const insforge = createInsForgeServerClient(accessToken)

    // 1. Check if slug exists
    const { data: existingTenant } = await insforge.database
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingTenant) {
      return { error: 'Esta URL ya está en uso. Por favor, elige otra.' }
    }

    // 2. Insert new tenant
    const { data: newTenant, error: insertError } = await insforge.database
      .from('tenants')
      .insert([{
        name,
        slug,
        phone,
        owner_id: user.id
      }])
      .select()
      .single()

    if (insertError) {
      return { error: 'Hubo un error al crear la barbería. Intenta nuevamente.' }
    }

    // 3. Update the user's profile to link the new tenant_id
    const { error: profileError } = await insforge.database
      .from('profiles')
      .update({ tenant_id: newTenant.id })
      .eq('id', user.id)

    if (profileError) {
      return { error: 'Se creó el negocio pero hubo un problema vinculándolo a tu cuenta.' }
    }

  } catch (err: unknown) {
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }

  // Success, redirect to dashboard
  redirect('/dashboard')
}
