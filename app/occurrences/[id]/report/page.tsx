import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { RoleName, SEVERITY_LABELS, STATUS_LABELS } from '@/lib/enums';
import ReportActions from '@/components/report-actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: `Relatório — ${occurrence?.title ?? 'Ocorrência'}` };
}

export default async function OccurrenceReportPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    include: {
      reporter: true,
      assignee: true,
      location: true,
      attachments: { orderBy: { createdAt: 'asc' } },
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      statusHistory: { include: { createdBy: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  if (!occurrence) {
    redirect('/occurrences');
  }

  const isAuthorized =
    session.user.role === RoleName.ADMIN ||
    session.user.role === RoleName.MANAGER ||
    occurrence.reporterId === session.user.id;

  if (!isAuthorized) {
    redirect('/occurrences');
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 print:bg-white">
      <div className="no-print mx-auto max-w-4xl px-4 py-6">
        <ReportActions occurrenceId={id} />
      </div>

      <article className="report-content mx-auto max-w-4xl px-8 py-10">
        <header className="border-b-2 border-slate-900 pb-6">
          <p className="text-sm uppercase tracking-widest text-slate-500">Gestor de Riscos — Relatório</p>
          <h1 className="mt-2 text-3xl font-bold">{occurrence.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            ID: {occurrence.id} · Gerado em {new Date().toLocaleString('pt-BR')}
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <InfoRow label="Status" value={STATUS_LABELS[occurrence.status]} />
          <InfoRow label="Gravidade" value={SEVERITY_LABELS[occurrence.severity]} />
          <InfoRow label="Categoria" value={occurrence.category} />
          <InfoRow label="Local" value={occurrence.location?.name ?? '—'} />
          <InfoRow
            label="Reportado por"
            value={occurrence.reporter?.name ?? occurrence.reporter?.email ?? 'Anônimo'}
          />
          <InfoRow label="Responsável" value={occurrence.assignee?.name ?? '—'} />
          <InfoRow
            label="Criado em"
            value={new Date(occurrence.createdAt).toLocaleString('pt-BR')}
          />
          <InfoRow
            label="Prazo SLA"
            value={occurrence.dueDate ? new Date(occurrence.dueDate).toLocaleString('pt-BR') : '—'}
          />
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Descrição</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{occurrence.description}</p>
        </section>

        {occurrence.statusHistory.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Histórico de status</h2>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 text-left">Data</th>
                  <th className="py-2 text-left">De → Para</th>
                  <th className="py-2 text-left">Por</th>
                  <th className="py-2 text-left">Nota</th>
                </tr>
              </thead>
              <tbody>
                {occurrence.statusHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-200">
                    <td className="py-2">{new Date(entry.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="py-2">
                      {STATUS_LABELS[entry.previous]} → {STATUS_LABELS[entry.current]}
                    </td>
                    <td className="py-2">{entry.createdBy.name}</td>
                    <td className="py-2">{entry.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {occurrence.comments.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Comentários</h2>
            <div className="mt-4 space-y-3">
              {occurrence.comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-slate-300 pl-4">
                  <p className="text-sm font-medium">
                    {comment.author.name} · {new Date(comment.createdAt).toLocaleString('pt-BR')}
                  </p>
                  <p className="mt-1 text-slate-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {occurrence.attachments.length > 0 && (
          <section className="mt-8 break-before-page">
            <h2 className="text-lg font-semibold">Anexos ({occurrence.attachments.length})</h2>
            <ul className="mt-4 list-disc pl-5 text-sm">
              {occurrence.attachments.map((a) => (
                <li key={a.id}>
                  {a.label ?? 'Anexo'} — {a.url}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-12 border-t border-slate-300 pt-6 text-sm text-slate-500">
          <p>Documento gerado automaticamente pelo Sistema Gestor de Riscos.</p>
          <p className="mt-4">Assinatura digital: {occurrence.id.slice(0, 8).toUpperCase()}</p>
        </footer>
      </article>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
