'use server'

import { createInsForgeServerClient } from '@/lib/insforge-server'
import { getAccessToken } from '@/lib/cookies'

export async function saveSettingsAction(tenantId: string, data: any) {
  const accessToken = await getAccessToken()
  if (!accessToken) return { error: 'No tienes sesión activa.' }

  const insforge = createInsForgeServerClient(accessToken)
  
  const { error } = await insforge.database
    .from('tenants')
    .update(data)
    .eq('id', tenantId)

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function uploadImageAction(tenantSlug: string, type: 'logo' | 'cover', formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No se envió ningún archivo.' }

  const accessToken = await getAccessToken()
  if (!accessToken) return { error: 'No autorizado.' }
  
  const insforge = createInsForgeServerClient(accessToken)

  const fileExt = file.name.split('.').pop()
  const fileName = `${tenantSlug}-${type}-${Math.random()}.${fileExt}`
  const filePath = `images/${fileName}`

  const { error: uploadError } = await insforge.storage
    .from('tenant_assets')
    .upload(filePath, file)

  if (uploadError) {
    return { error: uploadError.message }
  }

  const urlResponse = insforge.storage.from('tenant_assets').getPublicUrl(filePath) as any
  const newUrl = urlResponse?.data?.publicUrl || urlResponse?.publicUrl || urlResponse
  
  return { url: newUrl }
}
