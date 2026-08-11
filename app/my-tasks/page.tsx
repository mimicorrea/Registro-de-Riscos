import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/status-badge';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { OccurrenceSeverity, OccurrenceStatus } from '@/lib/enums';

type MyTaskOccurrence = {
  id: string;
  title: string;
  description: string;
  status: OccurrenceStatus;
  severity: OccurrenceSeverity;
  createdAt: Date;
  reporter: { name: string | null } | null;
  isAnonymous: boolean;
  location: { name: string } | null;
};

export const metadata = {
  title: 'Minhas Tarefas',
};

export default async function MyTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get occurrences assigned to current user
  const occurrences = (await prisma.occurrence.findMany({
    where: {
      assigneeId: session.user.id,
      NOT: {
        status: 'RESOLVED',
      },
    },
    include: {
      reporter: true,
      assignee: true,
      location: true,
      attachments: true,
      statusHistory: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  })) as MyTaskOccurrence[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/occurrences"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 mb-4 transition"
          >
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">👤 Minhas Tarefas</h1>
          <p className="text-slate-400 mt-2">Ocorrências atribuídas a você</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
            <div className="text-slate-400 text-sm mb-1">Total</div>
            <div className="text-3xl font-bold text-slate-900">{occurrences.length}</div>
          </div>

          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
            <div className="text-slate-400 text-sm mb-1">Em Andamento</div>
            <div className="text-3xl font-bold text-blue-400">
              {occurrences.filter((o) => o.status === 'IN_PROGRESS').length}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {occurrences.length > 0 ? (
          <div className="space-y-4">
            {occurrences.map((occurrence) => (
              <Link
                key={occurrence.id}
                href={`/occurrences/${occurrence.id}`}
                className="block bg-slate-100 rounded-lg p-6 border border-slate-200 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700">
                      {occurrence.title}
                    </h2>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {occurrence.description}
                    </p>
                  </div>

                  <div className="ml-4">
                    <StatusBadge status={occurrence.status} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex gap-4 text-sm text-slate-400">
                    {occurrence.location && (
                      <span>📍 {occurrence.location.name}</span>
                    )}
                    <span>👤 {occurrence.reporter?.name ?? (occurrence.isAnonymous ? 'Anônimo' : 'Usuário')}</span>
                    <span>
                      {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      occurrence.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-700'
                        : occurrence.severity === 'HIGH'
                        ? 'bg-orange-50 text-orange-700'
                        : occurrence.severity === 'MEDIUM'
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {occurrence.severity}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 rounded-lg p-12 border border-slate-200 text-center">
            <AlertCircle className="mx-auto mb-4 text-slate-500" size={48} />
            <p className="text-slate-400 text-lg">Nenhuma tarefa atribuída a você</p>
            <p className="text-slate-500 text-sm mt-2">Você está em dia! ✓</p>
          </div>
        )}
      </div>
    </div>
  );
}
