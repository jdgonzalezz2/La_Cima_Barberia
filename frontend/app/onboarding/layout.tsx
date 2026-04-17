import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'

export const metadata: Metadata = { title: 'Configura tu Negocio - Bookeiro' }

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  // If they already have a business, they don't need onboarding
  if (profile.tenant_id) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
