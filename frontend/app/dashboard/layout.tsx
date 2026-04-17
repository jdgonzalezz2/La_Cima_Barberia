import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  // If authenticated but hasn't created a business, force onboarding
  if (profile && !profile.tenant_id) {
    redirect('/onboarding')
  }

  return <>{children}</>
}
