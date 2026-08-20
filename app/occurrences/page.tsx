import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Plus } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OccurrencesList from '@/components/occurrences-list';
import { RoleName } from '@/lib/enums';
import type { MetricsOccurrence } from '@/lib/dashboard-metrics';

export const metadata = {
  title: 'Ocorrências',
};

// Página pública — qualquer visitante acompanha o status/urgência de todas as
// ocorrências, sem login. Quem está autenticado como gestor/admin vê tudo com
// mais detalhe (nome do reportante, atalho para o Dashboard); funcionário
// autenticado sem papel de gestor continua vendo só as próprias ocorrências.
export default async function OccurrencesPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user?.id);
  const isManager =
    session?.user?.role === RoleName.MANAGER || session?.user?.role === RoleName.ADMIN;

  const occurrences = (await prisma.occurrence.findMany({
    where: isAuthenticated && !isManager ? { reporterId: session!.user!.id } : undefined,
    include: {
      reporter: { select: { name: true } },
      location: { select: { id: true, name: true } },
      statusHistory: { select: { current: true, createdAt: true } },
      // Foto original (enviada por quem registrou) e foto de resolução
      // (enviada pelo admin/gestor ao tratar o problema) — as duas aparecem
      // aqui pra todo mundo, autenticado ou não.
      attachments: {
        select: { id: true, url: true, label: true },
        orderBy: { createdAt: 'asc' },
      },
      // Prévia do último comentário do admin/gestor no card — quem reportou
      // (ou o público, se for o caso) vê o retorno sem precisar abrir o
      // detalhe, que fica restrito a admin/gestor ou ao próprio autor.
      comments: {
        where: { author: { role: { in: [RoleName.ADMIN, RoleName.MANAGER] } } },
        select: { id: true, content: true, createdAt: true, author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })) as MetricsOccurrence[];

  const subtitle = isManager
    ? 'Todas as ocorrências da empresa'
    : isAuthenticated
      ? 'Suas ocorrências registradas'
      : 'Acompanhamento público — urgência e status de cada ocorrência registrada';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-500">Ocorrências</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Registros recentes</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {isManager && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Voltar
            </Link>
            <Link
              href={isAuthenticated ? '/occurrences/new' : '/'}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Nova ocorrência
            </Link>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <OccurrencesList
            occurrences={occurrences}
            isManager={isManager}
            clickable={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
