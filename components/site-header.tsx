'use client';

import Link from 'next/link';
import { LayoutDashboard, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { PwaInstallButton } from './pwa-install-button';

// Navegação reduzida aos 3 destinos do produto: Início (registro anônimo),
// Ocorrências (status público) e Dashboard (painel do gestor, pede login).
// Rotas antigas (/login, /my-tasks, /occurrences/new) continuam funcionando
// por URL direta, só saíram do menu.
export function SiteHeader() {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <img src="/logo.png" alt="Logo Gestor de Riscos" className="h-10 w-10 shrink-0" />
          Gestor de Riscos
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-slate-600 sm:gap-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <PwaInstallButton />
          <Link
            href="/"
            className="rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Início
          </Link>
          <Link
            href="/occurrences"
            className="rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Ocorrências
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
