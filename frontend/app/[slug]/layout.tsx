import { StorefrontThemeWrapper } from '@/components/storefront-theme-wrapper'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StorefrontThemeWrapper>{children}</StorefrontThemeWrapper>
}
