'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Download, FileText, LogOut, ShieldAlert, Timer, Trash2 } from 'lucide-react';
import AdvancedFilters, { type FilterState } from '@/components/advanced-filters';
import { LazyImage } from '@/components/lazy-image';
import StatusBadge from '@/components/status-badge';
import {
  SEVERITY_LABELS,
  type OccurrenceSeverity,
  type OccurrenceStatus,
} from '@/lib/enums';
import {
  buildTrend,
  calculateKpis,
  formatHours,
  type MetricsOccurrence,
} from '@/lib/dashboard-metrics';
import { exportOccurrencesToCsv } from '@/lib/export-utils';
import { applyFilters } from '@/lib/filter-occurrences';

interface DashboardViewProps {
  occurrences: MetricsOccurrence[];
  userName: string;
}

export default function DashboardView({ occurrences, userName }: DashboardViewProps) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    severities: [],
    categories: [],
    locationIds: [],
    search: '',
  });

  const filtered = useMemo(() => applyFilters(occurrences, filters), [occurrences, filters]);
  const kpis = useMemo(() => calculateKpis(filtered), [filtered]);
  const trend = useMemo(() => buildTrend(filtered, 14), [filtered]);
  const maxTrend = Math.max(...trend.map((p) => p.count), 1);

  const total = filtered.length;
  const inProgressCount = filtered.filter((o) => o.status === 'IN_PROGRESS').length;
  const resolvedCount = filtered.filter((o) => o.status === 'RESOLVED').length;

  const stats = [
    { title: 'Total filtrado', value: total, icon: FileText },
    { title: 'Em andamento', value: inProgressCount, icon: ShieldAlert },
    { title: 'Concluídas', value: resolvedCount, icon: CheckCircle2 },
  ];

  const severityCounts = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as OccurrenceSeverity[]).map((severity) => {
    const count = filtered.filter((o) => o.severity === severity).length;
    return {
      label: SEVERITY_LABELS[severity],
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color:
        severity === 'CRITICAL'
          ? 'bg-red-500'
          : severity === 'HIGH'
            ? 'bg-orange-400'
            : severity === 'MEDIUM'
              ? 'bg-yellow-400'
              : 'bg-emerald-400',
    };
  });

  const handleDelete = async (event: React.MouseEvent, occurrenceId: string, title: string) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      `Excluir a ocorrência "${title}"? Essa ação não pode ser desfeita — fotos, comentários e histórico também serão removidos.`
    );
    if (!confirmed) return;

    setDeletingId(occurrenceId);
    try {
      const res = await fetch(`/api/occurrences/${occurrenceId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao excluir ocorrência');
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir ocorrência');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-500">Painel gestor</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">Visão geral de ocorrências</h1>
              <p className="mt-2 text-sm text-slate-500">Olá, {userName}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportOccurrencesToCsv(filtered)}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
              <Link
                href="/occurrences"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ver todas
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="MTTR"
            value={formatHours(kpis.mttrHours)}
            subtitle="Tempo médio até resolução"
            icon={Timer}
          />
          <KpiCard
            title="Taxa de resolução"
            value={`${kpis.resolutionRate}%`}
            subtitle="Casos encerrados ou resolvidos"
            icon={CheckCircle2}
          />
          <KpiCard
            title="Fora do SLA"
            value={String(kpis.overdueCount)}
            subtitle="Prazo vencido e em aberto"
            icon={Clock}
          />
          <KpiCard
            title="Registros"
            value={String(occurrences.length)}
            subtitle="Total no período completo"
            icon={FileText}
          />
        </div>

        <div className="mb-8">
          <AdvancedFilters
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen((v) => !v)}
            onFilterChange={setFilters}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-200"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                <item.icon className="h-6 w-6" />
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Tendência (14 dias)</h2>
            <p className="mt-1 text-sm text-slate-500">Novas ocorrências por dia</p>
            <div className="mt-8 flex items-end gap-2" style={{ height: 160 }}>
              {trend.map((point) => (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">{point.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-blue-600 transition-all"
                    style={{ height: `${Math.max((point.count / maxTrend) * 120, point.count > 0 ? 8 : 2)}px` }}
                    title={`${point.label}: ${point.count}`}
                  />
                  <span className="text-[10px] text-slate-400">{point.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Por gravidade</h2>
            <div className="mt-6 space-y-4">
              {severityCounts.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{item.label}</span>
                    <span>
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-100">
                    <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Ocorrências recentes</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} resultado(s) com os filtros aplicados
          </p>

          {filtered.length > 0 ? (
            <div className="mt-6 space-y-4">
              {filtered.slice(0, 15).map((occurrence) => (
                <Link
                  key={occurrence.id}
                  href={`/occurrences/${occurrence.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-400"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      {occurrence.attachments?.[0] && (
                        <LazyImage
                          src={occurrence.attachments[0].url}
                          alt={occurrence.attachments[0].label || 'Foto da ocorrência'}
                          className="h-16 w-16 shrink-0 rounded-2xl"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{occurrence.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{occurrence.description}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                          <span>📍 {occurrence.location?.name ?? 'Sem local'}</span>
                          <span>👤 {occurrence.reporter?.name ?? (occurrence.isAnonymous ? 'Anônimo' : 'Usuário')}</span>
                          <span>{new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {occurrence.isAnonymous && (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                          Anônima
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        {SEVERITY_LABELS[occurrence.severity]}
                      </span>
                      <StatusBadge status={occurrence.status} />
                      <button
                        type="button"
                        onClick={(event) => handleDelete(event, occurrence.id, occurrence.title)}
                        disabled={deletingId === occurrence.id}
                        title="Excluir ocorrência"
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === occurrence.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-slate-500">Nenhuma ocorrência corresponde aos filtros.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
