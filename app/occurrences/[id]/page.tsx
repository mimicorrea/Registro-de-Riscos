import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import OccurrenceDetail from '@/components/occurrence-detail';
import { RoleName } from '@/lib/enums';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: occurrence?.title || 'Ocorrência não encontrada',
  };
}

export default async function OccurrencePage({ params }: PageProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch occurrence with all relations
  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    include: {
      reporter: true,
      assignee: true,
      location: true,
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
      statusHistory: {
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!occurrence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">❌ Ocorrência não encontrada</h1>
          <p className="text-slate-400 mb-6">A ocorrência que você procura não existe ou foi removida.</p>
          <Link
            href="/occurrences"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            ← Voltar para Ocorrências
          </Link>
        </div>
      </div>
    );
  }

  // Check permissions - must be manager/admin or reporter
  const isAuthorized =
    session.user.role === RoleName.ADMIN ||
    session.user.role === RoleName.MANAGER ||
    occurrence.reporterId === session.user.id;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">🔒 Acesso Negado</h1>
          <p className="text-slate-400 mb-6">Você não tem permissão para ver esta ocorrência.</p>
          <Link
            href="/occurrences"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            ← Voltar para Ocorrências
          </Link>
        </div>
      </div>
    );
  }

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser) {
    redirect('/login');
  }

  // Determine if user can edit (manager/admin)
  const canEdit = session.user.role === RoleName.ADMIN || session.user.role === RoleName.MANAGER;

  const serializedOccurrence = {
    ...occurrence,
    latitude: occurrence.latitude != null ? Number(occurrence.latitude) : null,
    longitude: occurrence.longitude != null ? Number(occurrence.longitude) : null,
  };

  return (
    <OccurrenceDetail
      occurrence={serializedOccurrence}
      currentUser={currentUser}
      canEdit={canEdit}
    />
  );
}
