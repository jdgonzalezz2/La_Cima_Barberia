import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'La Cima Barbería — Premium · Bogotá',
  description: 'La experiencia de barbería de alta gama en Bogotá. Reserva tu cita con nuestros maestros barberos.',
  manifest: '/manifest.json',
  keywords: ['barbería', 'Bogotá', 'premium', 'reservas', 'corte de cabello'],
  openGraph: {
    title: 'La Cima Barbería',
    description: 'La experiencia premium de Bogotá',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#C9A84C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="La Cima" />
      </head>
      <body>{children}</body>
    </html>
  );
}
