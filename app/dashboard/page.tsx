import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardView from '@/components/dashboard-view';
import { RoleName } from '@/lib/enums';
import type { MetricsOccurrence } from '@/lib/dashboard-metrics';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role === RoleName.EMPLOYEE) {
    redirect('/occurrences');
  }

  const occurrences = (await prisma.occurrence.findMany({
    include: {
      reporter: { select: { name: true } },
      location: { select: { id: true, name: true } },
      statusHistory: { select: { current: true, createdAt: true } },
      // Busca todos os anexos (não só o primeiro) para poder mostrar, lado a
      // lado, a foto original enviada no upload e a foto de resolução
      // enviada pelo gestor ao tratar o problema.
      attachments: {
        select: { id: true, url: true, label: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })) as MetricsOccurrence[];

  return (
    <DashboardView
      occurrences={occurrences}
      userName={session.user.name ?? session.user.email ?? 'Gestor'}
    />
  );
}
