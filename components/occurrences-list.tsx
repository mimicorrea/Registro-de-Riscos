'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Plus, WifiOff } from 'lucide-react';
import AdvancedFilters, { type FilterState } from '@/components/advanced-filters';
import { LazyImage } from '@/components/lazy-image';
import StatusBadge from '@/components/status-badge';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { cacheOccurrences, getCachedOccurrences } from '@/lib/offline-db';
import { SEVERITY_LABELS, type OccurrenceSeverity, type OccurrenceStatus } from '@/lib/enums';
import { applyFilters } from '@/lib/filter-occurrences';
import type { MetricsOccurrence } from '@/lib/dashboard-metrics';

type OccurrenceListItem = MetricsOccurrence & {
  id: string;
  status: OccurrenceStatus;
  severity: OccurrenceSeverity;
};

interface OccurrencesListProps {
  occurrences: OccurrenceListItem[];
  isManager: boolean;
  /** Quando false (visitante anônimo), a lista fica somente leitura — o
   * detalhe completo da ocorrência exige login, então não faz sentido linkar. */
  clickable?: boolean;
}

export default function OccurrencesList({ occurrences, isManager, clickable = true }: OccurrencesListProps) {
  const isOnline = useOnlineStatus();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [cachedItems, setCachedItems] = useState<OccurrenceListItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    severities: [],
    categories: [],
    search: '',
  });

  useEffect(() => {
    async function syncCache() {
      if (occurrences.length > 0) {
        await cacheOccurrences(
          occurrences.map((o) => ({
            id: o.id,
            title: o.title,
            status: o.status,
            severity: o.severity,
            createdAt: String(o.createdAt),
            locationName: o.location?.name,
          }))
        );
        setUsingCache(false);
        return;
      }

      if (!isOnline) {
        const cached = await getCachedOccurrences();
        if (cached.length > 0) {
          setCachedItems(
            cached.map((c) => ({
              id: c.id,
              title: c.title,
              description: '',
              category: 'RISK' as const,
              status: c.status as OccurrenceStatus,
              severity: c.severity as OccurrenceSeverity,
              createdAt: c.createdAt,
              updatedAt: c.createdAt,
              dueDate: null,
              reporter: { name: null },
              location: c.locationName ? { name: c.locationName } : null,
              statusHistory: [],
            }))
          );
          setUsingCache(true);
        }
      }
    }

    syncCache();
  }, [occurrences, isOnline]);

  const source = usingCache && cachedItems.length > 0 ? cachedItems : occurrences;
  const filtered = useMemo(() => applyFilters(source, filters), [source, filters]);

  return (
    <>
      {usingCache && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          Exibindo dados salvos localmente (modo offline)
        </div>
      )}

      <div className="mb-6">
        <AdvancedFilters
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          onFilterChange={setFilters}
        />
      </div>

      <p className="mb-4 text-sm text-slate-500">{filtered.length} registro(s)</p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <p className="text-slate-600">
            {source.length === 0
              ? 'Nenhuma ocorrência registrada ainda.'
              : 'Nenhuma ocorrência corresponde aos filtros.'}
          </p>
          {source.length === 0 && (
            <Link
              href={clickable ? '/occurrences/new' : '/'}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Registrar primeira ocorrência
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const card = (
              <article className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {item.attachments?.[0] && (
                      <LazyImage
                        src={item.attachments[0].url}
                        alt={item.attachments[0].label || 'Foto da ocorrência'}
                        className="h-16 w-16 shrink-0 rounded-2xl"
                      />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.location?.name ?? 'Local não informado'} ·{' '}
                        {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {isManager
                          ? ` · ${item.reporter?.name ?? (item.isAnonymous ? 'Anônimo' : 'Usuário')}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.isAnonymous && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                        Anônima
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {SEVERITY_LABELS[item.severity]}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </article>
            );

            return clickable ? (
              <Link key={item.id} href={`/occurrences/${item.id}`}>
                {card}
              </Link>
            ) : (
              <div key={item.id}>{card}</div>
            );
          })}
        </div>
      )}
    </>
  );
}
