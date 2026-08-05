import type { Metadata } from 'next';
import { Providers } from './providers';
import { SiteHeader } from '@/components/site-header';
import { VercelAnalytics } from '@/components/vercel-analytics';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gestor de Riscos',
  description: 'PWA corporativo para registro de incidentes e riscos',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" href="/icons/icon-192.png" as="image" type="image/png" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <SiteHeader />
          {children}
          <VercelAnalytics />
        </Providers>
      </body>
    </html>
  );
}
