import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: {
    default: 'FarmFlow — Agoo Agricultural Marketplace',
    template: '%s | FarmFlow',
  },
  description:
    'Fresh crops directly from Agoo, La Union farmers. Discover, order, and track locally grown produce from verified farmers in your community.',
  keywords: ['farm', 'fresh produce', 'Agoo', 'La Union', 'Philippines', 'agriculture', 'marketplace'],
  authors: [{ name: 'FarmFlow' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FarmFlow',
  },
  openGraph: {
    type: 'website',
    siteName: 'FarmFlow',
    title: 'FarmFlow — Agoo Agricultural Marketplace',
    description: 'Fresh crops directly from Agoo, La Union farmers.',
  },
};

export const viewport: Viewport = {
  themeColor: '#1B4332',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1B4332',
              color: '#fff',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#52B788', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#F87171', secondary: '#fff' },
              style: {
                background: '#7F1D1D',
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
