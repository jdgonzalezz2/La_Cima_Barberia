'use client'

import * as React from 'react'
import { ThemeProvider } from 'next-themes'

/**
 * Specifically designed for custom storefronts ([slug] routes).
 * Forces the theme to 'light' regardless of global Bookeiro platform preferences,
 * ensuring owner-defined branding is preserved.
 */
export function StorefrontThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      forcedTheme="light" 
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  )
}
