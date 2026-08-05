import type { OccurrenceCategory } from '@/lib/enums';
import type { FilterState } from '@/components/advanced-filters';
import type { MetricsOccurrence } from '@/lib/dashboard-metrics';

export function applyFilters(occurrences: MetricsOccurrence[], filters: FilterState): MetricsOccurrence[] {
  return occurrences.filter((occurrence) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(occurrence.status)) {
      return false;
    }
    if (filters.severities.length > 0 && !filters.severities.includes(occurrence.severity)) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(occurrence.category as OccurrenceCategory)) {
      return false;
    }
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      const haystack = `${occurrence.title} ${occurrence.description} ${occurrence.location?.name ?? ''}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(occurrence.createdAt) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(occurrence.createdAt) > to) return false;
    }
    return true;
  });
}
