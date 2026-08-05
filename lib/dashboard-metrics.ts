import type { OccurrenceCategory, OccurrenceSeverity, OccurrenceStatus } from '@/lib/enums';

export type MetricsOccurrence = {
  id: string;
  title: string;
  description: string;
  status: OccurrenceStatus;
  severity: OccurrenceSeverity;
  category: OccurrenceCategory | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  dueDate: Date | string | null;
  reporter: { name: string | null } | null;
  isAnonymous?: boolean;
  location: { name: string } | null;
  statusHistory: { current: OccurrenceStatus; createdAt: Date | string }[];
};

export type DashboardKpis = {
  mttrHours: number | null;
  avgResolutionHours: number | null;
  overdueCount: number;
  resolutionRate: number;
};

export type TrendPoint = {
  label: string;
  date: string;
  count: number;
};

const RESOLVED_STATUSES: OccurrenceStatus[] = ['RESOLVED', 'CLOSED'];

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function getResolutionDate(occurrence: MetricsOccurrence): Date | null {
  const resolvedEntry = occurrence.statusHistory
    .filter((entry) => RESOLVED_STATUSES.includes(entry.current))
    .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())[0];

  if (resolvedEntry) return toDate(resolvedEntry.createdAt);
  if (RESOLVED_STATUSES.includes(occurrence.status)) return toDate(occurrence.updatedAt);
  return null;
}

export function calculateKpis(occurrences: MetricsOccurrence[]): DashboardKpis {
  const total = occurrences.length;
  const resolved = occurrences.filter((o) => RESOLVED_STATUSES.includes(o.status));
  const resolutionHours = resolved
    .map((o) => {
      const end = getResolutionDate(o);
      if (!end) return null;
      return hoursBetween(toDate(o.createdAt), end);
    })
    .filter((h): h is number => h !== null && h >= 0);

  const mttrHours =
    resolutionHours.length > 0
      ? Math.round((resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length) * 10) / 10
      : null;

  const now = Date.now();
  const overdueCount = occurrences.filter((o) => {
    if (!o.dueDate || RESOLVED_STATUSES.includes(o.status)) return false;
    return toDate(o.dueDate).getTime() < now;
  }).length;

  return {
    mttrHours,
    avgResolutionHours: mttrHours,
    overdueCount,
    resolutionRate: total > 0 ? Math.round((resolved.length / total) * 100) : 0,
  };
}

export function buildTrend(occurrences: MetricsOccurrence[], days = 14): TrendPoint[] {
  const points: TrendPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const count = occurrences.filter((o) => {
      const created = toDate(o.createdAt);
      return created >= date && created < next;
    }).length;

    points.push({
      label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      date: date.toISOString().slice(0, 10),
      count,
    });
  }

  return points;
}

export function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 24) return `${hours}h`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days}d`;
}
